import { Request, Response, NextFunction } from "express";
import { CheckoutService } from "../services/checkout.service.js";
import { sendSuccess } from "../utils/response.js";

export class CheckoutController {
  static async calculateSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const summary = await CheckoutService.calculateCheckoutSummary(req.body);
      sendSuccess(res, summary, "Checkout summary calculated successfully");
    } catch (error) {
      next(error);
    }
  }
}
