import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import { sendSuccess } from "../utils/response.js";

export class PaymentController {
  static async createIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const intent = await PaymentService.createPaymentIntent(req.body.orderId, req.body.provider);
      sendSuccess(res, intent, "Payment intent created successfully");
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { providerPaymentId, providerTransactionId } = req.body;
      const payment = await PaymentService.handlePaymentSuccess(providerPaymentId, providerTransactionId);
      sendSuccess(res, payment, "Webhook processed successfully");
    } catch (error) {
      next(error);
    }
  }
}
