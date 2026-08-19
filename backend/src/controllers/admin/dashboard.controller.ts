import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../../services/admin/dashboard.service.js";
import { sendAdminSuccess } from "../../utils/adminResponse.js";

export class DashboardController {
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fromDate = req.query.fromDate as string | undefined;
      const toDate = req.query.toDate as string | undefined;
      const data = await DashboardService.getDashboardMetrics(fromDate, toDate);
      sendAdminSuccess(res, data, "Dashboard operational metrics retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }
}
