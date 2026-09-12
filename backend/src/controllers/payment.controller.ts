import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/response.js";
import prisma from "../lib/prisma.js";
import { NotFoundError, UnprocessableEntityError, ForbiddenError } from "../utils/errors.js";

export class PaymentController {
  static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const result = await PaymentService.verifyPaymentSignature({
        orderNumber,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId: req.user?.id,
      });
      sendSuccess(res, result, "Payment verified and order confirmed successfully");
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = (req.headers["x-razorpay-signature"] as string) || "";
      const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
      const result = await PaymentService.handleWebhookEvent(rawBody, signature, req.body);
      sendSuccess(res, result, "Webhook processed successfully");
    } catch (error) {
      next(error);
    }
  }

  static async retryPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderNumber } = req.params;
      const order = await prisma.order.findFirst({
        where: { orderNumber, deletedAt: null },
        include: { addresses: true },
      });

      if (!order) {
        throw new NotFoundError("Order not found");
      }

      if (req.user && order.userId && order.userId !== req.user.id) {
        throw new ForbiddenError("Access denied");
      }

      if (order.status !== "PENDING") {
        throw new UnprocessableEntityError(`Cannot retry payment for order in ${order.status} state`);
      }

      const shippingAddress = order.addresses.find((a) => a.type === "SHIPPING");
      const rzpData = await PaymentService.createRazorpayOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: Number(order.totalAmount),
        currency: order.currency,
        customerName: shippingAddress ? `${shippingAddress.firstName} ${shippingAddress.lastName || ""}`.trim() : "",
        customerEmail: order.customerEmail || "",
        customerPhone: shippingAddress?.phone || "",
      });

      sendSuccess(res, { orderNumber: order.orderNumber, razorpay: rzpData.razorpay }, "Payment retry initialized");
    } catch (error) {
      next(error);
    }
  }
}
