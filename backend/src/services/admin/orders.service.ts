import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { OrderStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { restoreInventoryForOrder } from "../../utils/inventory.utils.js";

// Valid order status state machine transitions
const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.FAILED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.PARTIALLY_REFUNDED, OrderStatus.REFUNDED],
  [OrderStatus.DELIVERED]: [OrderStatus.PARTIALLY_REFUNDED, OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.PARTIALLY_CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.PARTIALLY_REFUNDED]: [OrderStatus.REFUNDED],
  [OrderStatus.FAILED]: [],
};

export class AdminOrdersService {
  static async getOrders(query: Record<string, any>) {
    const { page, limit, sortBy, sortOrder, search, skip } = parseAdminQueryParams(
      query,
      ["createdAt", "orderNumber", "totalAmount", "status"],
      "createdAt"
    );

    const where: any = {};

    if (query.status && Object.values(OrderStatus).includes(query.status as OrderStatus)) {
      where.status = query.status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          currency: true,
          customerEmail: true,
          customerPhone: true,
          placedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          items: {
            select: { id: true, quantity: true, productName: true },
          },
          payments: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { status: true, provider: true, amount: true },
          },
          shipments: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { status: true, trackingNumber: true, carrier: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formatted = orders.map((o) => {
      const customerName = o.user
        ? [o.user.firstName, o.user.lastName].filter(Boolean).join(" ").trim()
        : null;

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount.toNumber(),
        currency: o.currency,
        customerEmail: o.customerEmail || o.user?.email || null,
        customerName: customerName || null,
        customerPhone: o.customerPhone || o.user?.phone || null,
        userId: o.user?.id || null,
        itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
        lineItemCount: o.items.length,
        previewItemName: o.items[0]?.productName || null,
        paymentStatus: o.payments[0]?.status || "PENDING",
        paymentProvider: o.payments[0]?.provider || null,
        shipmentStatus: o.shipments[0]?.status || null,
        trackingNumber: o.shipments[0]?.trackingNumber || null,
        carrier: o.shipments[0]?.carrier || null,
        placedAt: o.placedAt,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      };
    });

    return { orders: formatted, total, page, limit };
  }

  private static mapOrderAddress(address: {
    type: string;
    firstName: string;
    lastName: string | null;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phone: string | null;
  }) {
    return {
      type: address.type,
      fullName: [address.firstName, address.lastName].filter(Boolean).join(" ").trim(),
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      phone: address.phone,
    };
  }

  static async getOrderDetails(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        addresses: true,
        items: {
          include: {
            variant: {
              select: {
                sku: true,
                variantName: true,
                product: {
                  select: {
                    images: {
                      take: 1,
                      orderBy: { sortOrder: "asc" },
                      select: { imageUrl: true, altText: true },
                    },
                  },
                },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
          include: {
            changedByUser: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        payments: {
          include: { transactions: true },
        },
        shipments: {
          include: { items: true },
        },
        invoice: true,
        returns: true,
        refunds: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const shippingAddress = order.addresses.find((a) => a.type === "SHIPPING");
    const billingAddress = order.addresses.find((a) => a.type === "BILLING");
    const customerName = order.user
      ? [order.user.firstName, order.user.lastName].filter(Boolean).join(" ").trim()
      : shippingAddress
        ? [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ").trim()
        : null;

    const primaryPayment = order.payments[0]
      ? {
          id: order.payments[0].id,
          provider: order.payments[0].provider,
          status: order.payments[0].status,
          amount: order.payments[0].amount.toNumber(),
          currency: order.payments[0].currency,
          capturedAt: order.payments[0].capturedAt,
          createdAt: order.payments[0].createdAt,
        }
      : null;

    const primaryShipment = order.shipments[0]
      ? {
          id: order.shipments[0].id,
          status: order.shipments[0].status,
          carrier: order.shipments[0].carrier,
          trackingNumber: order.shipments[0].trackingNumber,
          shippedAt: order.shipments[0].shippedAt,
          deliveredAt: order.shipments[0].deliveredAt,
          createdAt: order.shipments[0].createdAt,
        }
      : null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      subtotal: order.subtotal.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      shippingAmount: order.shippingAmount.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      customerEmail: order.customerEmail || order.user?.email || null,
      customerPhone: order.customerPhone || order.user?.phone || null,
      customerName,
      userId: order.userId,
      user: order.user,
      notes: order.notes,
      placedAt: order.placedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: shippingAddress ? this.mapOrderAddress(shippingAddress) : null,
      billingAddress: billingAddress ? this.mapOrderAddress(billingAddress) : null,
      primaryPayment,
      primaryShipment,
      invoice: order.invoice
        ? {
            id: order.invoice.id,
            invoiceNumber: order.invoice.invoiceNumber,
            status: order.invoice.status,
            totalAmount: order.invoice.totalAmount.toNumber(),
            issuedAt: order.invoice.issuedAt,
            paidAt: order.invoice.paidAt,
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        sku: item.sku,
        productName: item.productName,
        variantName: item.variantName || item.variant?.variantName || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        discountAmount: item.discountAmount.toNumber(),
        taxAmount: item.taxAmount.toNumber(),
        totalAmount: item.totalAmount.toNumber(),
        imageUrl: item.variant?.product?.images?.[0]?.imageUrl || null,
      })),
      statusHistory: order.statusHistory.map((hist) => ({
        id: hist.id,
        oldStatus: hist.oldStatus,
        newStatus: hist.newStatus,
        reason: hist.reason,
        createdAt: hist.createdAt,
        changedBy: hist.changedBy,
        changedByName: hist.changedByUser
          ? [hist.changedByUser.firstName, hist.changedByUser.lastName].filter(Boolean).join(" ").trim() ||
            hist.changedByUser.email
          : "System",
        changedByEmail: hist.changedByUser?.email || null,
      })),
      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: p.amount.toNumber(),
        currency: p.currency,
        capturedAt: p.capturedAt,
        createdAt: p.createdAt,
      })),
      shipments: order.shipments.map((s) => ({
        id: s.id,
        status: s.status,
        carrier: s.carrier,
        trackingNumber: s.trackingNumber,
        shippedAt: s.shippedAt,
        deliveredAt: s.deliveredAt,
        createdAt: s.createdAt,
      })),
    };
  }

  static async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminUserId: string,
    notes?: string
  ) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const currentStatus = order.status;
    const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${
          allowed.length ? allowed.join(", ") : "None (Terminal State)"
        }`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: currentStatus,
          newStatus,
          changedBy: adminUserId,
          reason: notes,
        },
      });

      // If transitioning to CANCELLED, restore inventory
      if (newStatus === OrderStatus.CANCELLED) {
        const orderItems = await tx.orderItem.findMany({ where: { orderId } });
        await restoreInventoryForOrder(
          tx,
          orderId,
          order.orderNumber,
          orderItems,
          notes || `Order #${order.orderNumber} cancelled by admin`,
          adminUserId
        );
      }
    });

    return this.getOrderDetails(orderId);
  }

  static async getOrderStatusHistory(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError("Order not found");

    return prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
      include: {
        changedByUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
