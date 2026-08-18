import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError, ForbiddenError } from "../utils/errors.js";
import { parsePaginationParams, buildPaginationMeta } from "../utils/pagination.js";
import { AddressType, OrderStatus } from "@prisma/client";

export class OrderService {
  static async createOrder(
    userId: string | undefined,
    customerEmail: string | undefined,
    payload: {
      items: { variantId: string; quantity: number }[];
      shippingAddress: any;
      billingAddress?: any;
      couponCode?: string;
      notes?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: any[] = [];

      // 1. Check stock and prepare order items
      for (const item of payload.items) {
        const variant = await tx.productVariant.findFirst({
          where: { id: item.variantId, isActive: true, deletedAt: null },
          include: {
            product: true,
            inventory: true,
          },
        });

        if (!variant) {
          throw new NotFoundError(`Product variant (${item.variantId}) not found or inactive`);
        }

        const available = variant.inventory
          ? variant.inventory.quantityOnHand - variant.inventory.quantityReserved
          : 0;

        if (available < item.quantity) {
          throw new UnprocessableEntityError(
            `Stock unavailable for ${variant.product.name} (${variant.variantName || variant.sku}). Only ${available} available.`
          );
        }

        // Reserve stock
        if (variant.inventory) {
          await tx.inventory.update({
            where: { id: variant.inventory.id },
            data: { quantityReserved: variant.inventory.quantityReserved + item.quantity },
          });

          const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
          await tx.inventoryReservation.create({
            data: {
              variantId: variant.id,
              quantity: item.quantity,
              expiresAt: expiryDate,
            },
          });
        }

        const unitPrice = variant.price.toNumber();
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;

        orderItemsData.push({
          variantId: variant.id,
          sku: variant.sku,
          productName: variant.product.name,
          variantName: variant.variantName,
          quantity: item.quantity,
          unitPrice,
          totalAmount: itemTotal,
        });
      }

      // 2. Coupon Validation & Discount Calculation
      let discountAmount = 0;
      let couponRecord: any = null;

      if (payload.couponCode) {
        couponRecord = await tx.coupon.findFirst({
          where: { code: payload.couponCode, isActive: true },
        });

        if (couponRecord) {
          if (couponRecord.minimumOrderAmount && subtotal < couponRecord.minimumOrderAmount.toNumber()) {
            throw new UnprocessableEntityError(
              `Order subtotal (${subtotal}) does not meet coupon minimum of ${couponRecord.minimumOrderAmount.toNumber()}`
            );
          }

          if (couponRecord.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * couponRecord.discountValue.toNumber()) / 100;
            if (couponRecord.maximumDiscountAmount) {
              discountAmount = Math.min(discountAmount, couponRecord.maximumDiscountAmount.toNumber());
            }
          } else {
            discountAmount = couponRecord.discountValue.toNumber();
          }

          discountAmount = Math.min(discountAmount, subtotal);
        }
      }

      const shippingAmount = subtotal > 1999 ? 0 : 99; // Free shipping over 1999 INR
      const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST standard
      const totalAmount = subtotal - discountAmount + shippingAmount + taxAmount;

      const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Create Order Header
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          customerEmail: customerEmail || payload.shippingAddress.email || null,
          status: OrderStatus.PENDING,
          subtotal,
          discountAmount,
          shippingAmount,
          taxAmount,
          totalAmount,
          notes: payload.notes,
          placedAt: new Date(),
          addresses: {
            create: [
              {
                type: AddressType.SHIPPING,
                ...payload.shippingAddress,
              },
              {
                type: AddressType.BILLING,
                ...(payload.billingAddress || payload.shippingAddress),
              },
            ],
          },
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: {
              newStatus: OrderStatus.PENDING,
              reason: "Order placed by customer",
            },
          },
        },
        include: {
          addresses: true,
          items: true,
        },
      });

      // 4. Record Coupon Usage
      if (couponRecord) {
        await tx.couponUsage.create({
          data: {
            couponId: couponRecord.id,
            userId: userId || null,
            orderId: order.id,
            discountAmount,
          },
        });

        await tx.coupon.update({
          where: { id: couponRecord.id },
          data: { usedCount: couponRecord.usedCount + 1 },
        });
      }

      return order;
    });
  }

  static async getUserOrders(userId: string, queryPage?: string, queryLimit?: string) {
    const { page, limit, skip } = parsePaginationParams(queryPage, queryLimit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          addresses: true,
          shipments: true,
        },
      }),
      prisma.order.count({ where: { userId, deletedAt: null } }),
    ]);

    const meta = buildPaginationMeta(page, limit, total);
    return { data: orders, meta };
  }

  static async getOrderByNumber(orderNumber: string, userId?: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, deletedAt: null },
      include: {
        items: true,
        addresses: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        shipments: { include: { statusHistory: true } },
        payments: { include: { transactions: true } },
        invoice: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (userId && order.userId && order.userId !== userId) {
      throw new ForbiddenError("Access denied. You cannot view orders belonging to another user.");
    }

    return order;
  }

  static async cancelOrder(orderId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId, deletedAt: null },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new UnprocessableEntityError(`Cannot cancel order in ${order.status} state.`);
      }

      // Release stock
      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await tx.inventory.findFirst({ where: { variantId: item.variantId } });
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantityReserved: Math.max(0, inventory.quantityReserved - item.quantity),
              },
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          statusHistory: {
            create: {
              oldStatus: order.status,
              newStatus: OrderStatus.CANCELLED,
              changedBy: userId,
              reason: "Cancelled by user",
            },
          },
        },
      });

      return updated;
    });
  }
}
