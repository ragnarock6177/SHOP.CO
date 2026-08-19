import { Request, Response, NextFunction } from "express";
import { AdminReturnsService } from "../../services/admin/returns.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminReturnsController {
  static async getReturns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminReturnsService.getReturns(req.query);
      sendAdminPaginated(res, result.returns, result.page, result.limit, result.total, "Return requests retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getReturnDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returnReq = await AdminReturnsService.getReturnDetails(req.params.id);
      sendAdminSuccess(res, returnReq, "Return request details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async updateReturnStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returnReq = await AdminReturnsService.updateReturnStatus(req.params.id, req.body.status, req.body.adminNotes);
      sendAdminSuccess(res, returnReq, `Return status updated to '${req.body.status}'.`);
    } catch (error) {
      next(error);
    }
  }

  static async getRefunds(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminReturnsService.getRefunds(req.query);
      sendAdminPaginated(res, result.refunds, result.page, result.limit, result.total, "Refund transactions retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async processRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refund = await AdminReturnsService.processRefund(req.body);
      sendAdminSuccess(res, refund, "Refund processed successfully.", 201);
    } catch (error) {
      next(error);
    }
  }
}
