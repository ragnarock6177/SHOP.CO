import { Request, Response, NextFunction } from "express";
import { AdminPaymentsService } from "../../services/admin/payments.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminPaymentsController {
  static async getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminPaymentsService.getPayments(req.query);
      sendAdminPaginated(res, result.payments, result.page, result.limit, result.total, "Payments log retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await AdminPaymentsService.getPaymentDetails(req.params.id);
      sendAdminSuccess(res, payment, "Payment details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminPaymentsService.getInvoices(req.query);
      sendAdminPaginated(res, result.invoices, result.page, result.limit, result.total, "Invoices list retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }
}
