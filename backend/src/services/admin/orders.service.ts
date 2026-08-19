import prisma from "../../lib/prisma.js";
import { parseAdminQueryParams } from "../../utils/adminQueryParams.js";
import { OrderStatus } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../utils/errors.js";

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
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          items: {
            select: { id: true, quantity: true },
          },
          payments: {
            take: 1,
            select: { status: true, provider: true },
          },
          shipments: {
            take: 1,
            select: { status: true, trackingNumber: true, carrier: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formatted = orders.map((o) => ({
      ...o,
      totalAmount: o.totalAmount.toNumber(),
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      paymentStatus: o.payments[0]?.status || "PENDING",
      shipmentStatus: o.shipments[0]?.status || "PENDING",
    }));

    return { orders: formatted, total, page, limit };
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
              select: { sku: true, variantName: true },
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

    return {
      ...order,
      subtotal: order.subtotal.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      shippingAmount: order.shippingAmount.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
        totalAmount: item.totalAmount.toNumber(),
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

      // If transitioning to CANCELLED, release reserved inventory
      if (newStatus === OrderStatus.CANCELLED) {
        const orderItems = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of orderItems) {
          if (item.variantId) {
            const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
            if (inv) {
              await tx.inventory.update({
                where: { id: inv.id },
                data: {
                  quantityOnHand: inv.quantityOnHand + item.quantity,
                },
              });

              await tx.inventoryMovement.create({
                data: {
                  variantId: item.variantId,
                  movementType: "RELEASE",
                  quantity: item.quantity,
                  referenceType: "ORDER_CANCELLATION",
                  referenceId: orderId,
                  notes: `Order #${order.orderNumber} cancelled by admin`,
                  createdBy: adminUserId,
                },
              });
            }
          }
        }
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
