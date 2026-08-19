import { Request, Response, NextFunction } from "express";
import { AuditService } from "../../services/admin/audit.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminAuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuditService.getAuditLogs(req.query);
      sendAdminPaginated(res, result.logs, result.page, result.limit, result.total, "Audit logs retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const log = await AuditService.getAuditLogById(req.params.id);
      sendAdminSuccess(res, log, "Audit log detail retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }
}
