import prisma from "../../lib/prisma.js";
import {
  OrderStatus,
  ReturnStatus,
  RefundStatus,
  UserStatus,
} from "@prisma/client";

export class DashboardService {
  static async getDashboardMetrics(fromDate?: string, toDate?: string) {
    const dateFilter: any = { deletedAt: null };
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) {
        startDate = new Date(fromDate);
        dateFilter.createdAt.gte = startDate;
      }
      if (toDate) {
        endDate = new Date(toDate);
        dateFilter.createdAt.lte = endDate;
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 1. Order & Sales Aggregations
    const [
      totalOrders,
      todayOrders,
      ordersAggregate,
      refundsAggregate,
      orderStatusCounts,
      orderItemsAggregate,
    ] = await Promise.all([
      prisma.order.count({ where: { ...dateFilter } }),
      prisma.order.count({
        where: {
          deletedAt: null,
          createdAt: { gte: todayStart },
        },
      }),
      prisma.order.aggregate({
        where: {
          ...dateFilter,
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
          },
        },
        _sum: {
          totalAmount: true,
          subtotal: true,
          discountAmount: true,
          shippingAmount: true,
          taxAmount: true,
        },
      }),
      prisma.refund.aggregate({
        where: {
          status: RefundStatus.COMPLETED,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: startDate } : {}),
                  ...(endDate ? { lte: endDate } : {}),
                },
              }
            : {}),
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { ...dateFilter },
        _count: { id: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          order: {
            ...dateFilter,
            status: {
              notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
            },
          },
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    const grossRevenue = Number(ordersAggregate._sum.totalAmount || 0);
    const totalRefunds = Number(refundsAggregate._sum.amount || 0);
    const netRevenue = Math.max(0, grossRevenue - totalRefunds);
    const totalItemsSold = Number(orderItemsAggregate._sum.quantity || 0);

    // Status map
    const statusMap: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };
    for (const group of orderStatusCounts) {
      statusMap[group.status] = group._count.id;
    }
    const unfulfilledOrders = (statusMap.PENDING || 0) + (statusMap.CONFIRMED || 0) + (statusMap.PROCESSING || 0);

    // 2. Prior Period Comparison (Trends)
    let revenueTrend: string | undefined = undefined;
    let ordersTrend: string | undefined = undefined;

    if (startDate) {
      const currentEnd = endDate || new Date();
      const durationMs = currentEnd.getTime() - startDate.getTime();

      if (durationMs > 0) {
        const prevStart = new Date(startDate.getTime() - durationMs);
        const prevEnd = startDate;

        const [prevOrdersAggregate, prevOrdersCount] = await Promise.all([
          prisma.order.aggregate({
            where: {
              deletedAt: null,
              createdAt: { gte: prevStart, lt: prevEnd },
              status: {
                notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
              },
            },
            _sum: { totalAmount: true },
          }),
          prisma.order.count({
            where: {
              deletedAt: null,
              createdAt: { gte: prevStart, lt: prevEnd },
            },
          }),
        ]);

        const prevGrossRevenue = Number(prevOrdersAggregate._sum.totalAmount || 0);
        if (prevGrossRevenue > 0) {
          const diffPct = ((grossRevenue - prevGrossRevenue) / prevGrossRevenue) * 100;
          revenueTrend = `${diffPct >= 0 ? "+" : ""}${diffPct.toFixed(1)}% vs last period`;
        } else if (grossRevenue > 0) {
          revenueTrend = "+100% vs last period";
        } else {
          revenueTrend = "+0.0% vs last period";
        }

        if (prevOrdersCount > 0) {
          const diffOrdersPct = ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100;
          ordersTrend = `${diffOrdersPct >= 0 ? "+" : ""}${diffOrdersPct.toFixed(1)}% vs last period`;
        }
      }
    }

    // 3. Inventory Health & Low Stock Alerts
    const inventories = await prisma.inventory.findMany({
      select: {
        id: true,
        quantityOnHand: true,
        quantityReserved: true,
        reorderLevel: true,
        variant: {
          select: {
            id: true,
            sku: true,
            price: true,
            product: {
              select: {
                id: true,
                name: true,
                images: { take: 1, select: { imageUrl: true } },
              },
            },
          },
        },
      } as any,
    });

    const lowStockAlerts = (inventories as any[])
      .map((inv) => {
        const available = inv.quantityOnHand - inv.quantityReserved;
        return {
          id: inv.id,
          variantId: inv.variant?.id || "",
          sku: inv.variant?.sku || "",
          productTitle: inv.variant?.product?.name || "Product",
          productImage: inv.variant?.product?.images?.[0]?.imageUrl || null,
          quantityOnHand: inv.quantityOnHand,
          quantityReserved: inv.quantityReserved,
          availableQuantity: available,
          reorderLevel: inv.reorderLevel,
          isLowStock: available <= inv.reorderLevel,
          isOutOfStock: available <= 0,
        };
      })
      .filter((inv) => inv.isLowStock);

    const lowStockCount = lowStockAlerts.length;
    const outOfStockCount = lowStockAlerts.filter((inv) => inv.isOutOfStock).length;

    // 4. After Sales Queue
    const [pendingReturnsCount, processingRefundsCount] = await Promise.all([
      prisma.return.count({
        where: {
          status: { in: [ReturnStatus.REQUESTED, ReturnStatus.APPROVED] },
        },
      }),
      prisma.refund.count({
        where: {
          status: { in: [RefundStatus.PENDING, RefundStatus.PROCESSING] },
        },
      }),
    ]);

    // 5. Top Performing Products in Window (Real aggregation from OrderItems)
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ["productName", "sku"],
      where: {
        order: {
          ...dateFilter,
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
          },
        },
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
      take: 5,
    });

    const topSellingProducts = topOrderItems.map((item) => ({
      name: item.productName,
      sku: item.sku,
      unitsSold: Number(item._sum.quantity || 0),
      revenue: Number(item._sum.totalAmount || 0),
    }));

    // 6. Payment Distribution in Window
    const paymentGroups = await prisma.payment.groupBy({
      by: ["provider"],
      where: {
        order: { ...dateFilter },
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalPaymentVolume = paymentGroups.reduce((acc, curr) => acc + Number(curr._sum.amount || 0), 0);
    const paymentDistribution = paymentGroups.map((group) => {
      const amount = Number(group._sum.amount || 0);
      const percentage = totalPaymentVolume > 0 ? Math.round((amount / totalPaymentVolume) * 100) : 0;
      return {
        provider: group.provider.toUpperCase(),
        count: group._count.id,
        amount,
        percentage,
      };
    });

    // 7. Sales Velocity Timeline (Dynamic buckets based on date window)
    const rawOrdersTimeline = await prisma.order.findMany({
      where: {
        ...dateFilter,
        status: {
          notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.FAILED],
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Bucket by day or standard intervals
    const timelineBuckets: Record<string, { date: string; label: string; revenue: number; orders: number }> = {};
    for (const ord of rawOrdersTimeline) {
      const key = ord.createdAt.toISOString().split("T")[0];
      const label = new Date(ord.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!timelineBuckets[key]) {
        timelineBuckets[key] = { date: key, label, revenue: 0, orders: 0 };
      }
      timelineBuckets[key].revenue += Number(ord.totalAmount);
      timelineBuckets[key].orders += 1;
    }

    const salesVelocityTimeline = Object.values(timelineBuckets).slice(-14);

    // 8. Urgent Action Operational Metrics (Orders older than 24h pending fulfillment)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const overduePendingOrdersCount = await prisma.order.count({
      where: {
        deletedAt: null,
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
        createdAt: { lt: oneDayAgo },
      },
    });

    // 9. Recent Orders Feed (Last 6)
    const rawRecentOrders = await prisma.order.findMany({
      take: 6,
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        customerEmail: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        addresses: {
          where: { type: "SHIPPING" },
          take: 1,
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          select: {
            provider: true,
            status: true,
          },
          take: 1,
        },
      },
    });

    const recentOrders = rawRecentOrders.map((o) => {
      const userFullName = o.user
        ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim()
        : "";
      const addressFullName = o.addresses[0]
        ? `${o.addresses[0].firstName || ""} ${o.addresses[0].lastName || ""}`.trim()
        : "";
      const customerName = userFullName || addressFullName || "Guest Customer";
      const customerEmail = o.user?.email || o.customerEmail || "N/A";

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName,
        customerEmail,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        paymentProvider: o.payments[0]?.provider || "COD",
        paymentStatus: o.payments[0]?.status || "PENDING",
        createdAt: o.createdAt.toISOString(),
      };
    });

    // 10. Recent Audit Activity Stream (Last 6)
    const rawRecentAuditLogs = await prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        action: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const recentAuditLogs = rawRecentAuditLogs.map((log) => {
      const actorName = log.user
        ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email
        : "System";

      return {
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorName,
        createdAt: log.createdAt.toISOString(),
      };
    });

    return {
      grossRevenue,
      netRevenue,
      totalRefunds,
      revenueTrend,
      totalOrders,
      todayOrders,
      ordersTrend,
      totalItemsSold,
      unfulfilledOrders,
      statusBreakdown: statusMap,
      lowStockCount,
      outOfStockCount,
      pendingReturns: pendingReturnsCount,
      pendingRefunds: processingRefundsCount,
      overduePendingOrdersCount,
      topSellingProducts,
      paymentDistribution,
      salesVelocityTimeline,
      lowStockAlerts: lowStockAlerts.slice(0, 5),
      recentOrders,
      recentAuditLogs,
    };
  }
}
