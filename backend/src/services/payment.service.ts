import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError } from "../utils/errors.js";
import { OrderStatus, PaymentStatus, PaymentTransactionType, InvoiceStatus, InventoryMovementType } from "@prisma/client";

export class PaymentService {
  static async createPaymentIntent(orderId: string, provider = "STRIPE") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new UnprocessableEntityError(`Cannot create payment for order in ${order.status} state.`);
    }

    // Mock payment provider intent ID
    const providerPaymentId = `pi_mock_${Date.now()}_${order.id.slice(0, 8)}`;

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        providerPaymentId,
        status: PaymentStatus.PENDING,
        currency: order.currency,
        amount: order.totalAmount,
      },
    });

    return {
      paymentId: payment.id,
      providerPaymentId,
      clientSecret: `secret_mock_${providerPaymentId}`,
      amount: payment.amount.toNumber(),
      currency: payment.currency,
    };
  }

  static async handlePaymentSuccess(providerPaymentId: string, providerTransactionId?: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { providerPaymentId },
        include: {
          order: {
            include: { items: true },
          },
        },
      });

      if (!payment) {
        throw new NotFoundError("Payment record not found for provider payment ID");
      }

      if (payment.status === PaymentStatus.CAPTURED) {
        return payment; // Already captured idempotently
      }

      // 1. Update Payment Status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.CAPTURED,
          capturedAt: new Date(),
          transactions: {
            create: {
              transactionType: PaymentTransactionType.CAPTURE,
              providerTransactionId: providerTransactionId || `tx_${Date.now()}`,
              amount: payment.amount,
              currency: payment.currency,
              status: PaymentStatus.CAPTURED,
            },
          },
        },
      });

      // 2. Update Order Status
      const order = payment.order;
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              oldStatus: order.status,
              newStatus: OrderStatus.CONFIRMED,
              reason: "Payment captured successfully",
            },
          },
        },
      });

      // 3. Deduct Inventory Stock (Move fromOnHand & Reserved to Sold)
      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await tx.inventory.findFirst({ where: { variantId: item.variantId } });
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantityOnHand: Math.max(0, inventory.quantityOnHand - item.quantity),
                quantityReserved: Math.max(0, inventory.quantityReserved - item.quantity),
              },
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                movementType: InventoryMovementType.SALE,
                quantity: -item.quantity,
                referenceType: "ORDER",
                referenceId: order.id,
                notes: `Deducted for Order ${order.orderNumber}`,
              },
            });
          }
        }
      }

      // 4. Create Invoice
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber,
          status: InvoiceStatus.PAID,
          currency: order.currency,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          discountAmount: order.discountAmount,
          totalAmount: order.totalAmount,
          issuedAt: new Date(),
          paidAt: new Date(),
        },
      });

      return updatedPayment;
    });
  }
}
