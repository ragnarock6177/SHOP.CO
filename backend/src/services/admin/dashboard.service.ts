import prisma from "../../lib/prisma.js";
import {
  OrderStatus,
  ReturnStatus,
  RefundStatus,
  UserStatus,
} from "@prisma/client";

export class DashboardService {
  static async getDashboardMetrics(fromDate?: string, toDate?: string) {
    const dateFilter: any = {};
    if (fromDate || toDate) {
      dateFilter.createdAt = {};
      if (fromDate) dateFilter.createdAt.gte = new Date(fromDate);
      if (toDate) dateFilter.createdAt.lte = new Date(toDate);
    }

    // 1. Order & Sales Aggregations
    const [
      totalOrders,
      todayOrders,
      ordersAggregate,
      pendingOrdersCount,
      processingOrdersCount,
      shippedOrdersCount,
      deliveredOrdersCount,
    ] = await Promise.all([
      prisma.order.count({ where: { ...dateFilter } }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          ...dateFilter,
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.count({
        where: { status: OrderStatus.PENDING, ...dateFilter },
      }),
      prisma.order.count({
        where: { status: OrderStatus.PROCESSING, ...dateFilter },
      }),
      prisma.order.count({
        where: { status: OrderStatus.SHIPPED, ...dateFilter },
      }),
      prisma.order.count({
        where: { status: OrderStatus.DELIVERED, ...dateFilter },
      }),
    ]);

    const grossRevenue = Number(ordersAggregate._sum.totalAmount || 0);

    // 2. Inventory Health Alerts
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
              },
            },
          },
        },
      },
    });

    const lowStockAlerts = inventories
      .map((inv) => {
        const available = inv.quantityOnHand - inv.quantityReserved;
        return {
          id: inv.id,
          variantId: inv.variant.id,
          sku: inv.variant.sku,
          productTitle: inv.variant.product.name,
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
    const outOfStockCount = lowStockAlerts.filter(
      (inv) => inv.isOutOfStock,
    ).length;

    // 3. After Sales & Customer Metrics
    const [pendingReturnsCount, processingRefundsCount, activeCustomersCount] =
      await Promise.all([
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
        prisma.user.count({
          where: { status: UserStatus.ACTIVE },
        }),
      ]);

    // 4. Recent Orders Feed (Last 10)
    const rawRecentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        payments: {
          select: {
            status: true,
          },
          take: 1,
        },
        shipments: {
          select: {
            status: true,
          },
          take: 1,
        },
      },
    });

    const recentOrders = rawRecentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      orderStatus: o.status,
      paymentStatus: o.payments[0]?.status || "PENDING",
      shipmentStatus: o.shipments[0]?.status || "PENDING",
      createdAt: o.createdAt,
      user: o.user,
    }));

    // 5. Recent Audit Activity Stream (Last 10)
    const recentAuditLogs = await prisma.auditLog.findMany({
      take: 10,
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

    return {
      metrics: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrdersCount,
          processing: processingOrdersCount,
          shipped: shippedOrdersCount,
          delivered: deliveredOrdersCount,
        },
        financial: {
          grossRevenue,
        },
        inventory: {
          lowStockCount,
          outOfStockCount,
        },
        afterSales: {
          pendingReturns: pendingReturnsCount,
          processingRefunds: processingRefundsCount,
        },
        customers: {
          activeCount: activeCustomersCount,
        },
      },
      lowStockAlerts: lowStockAlerts.slice(0, 10),
      recentOrders,
      recentAuditLogs,
    };
  }
}
