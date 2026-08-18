import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class AdminController {
  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await AdminService.createProduct(req.body);
      sendSuccess(res, product, "Product created successfully by admin", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const order = await AdminService.updateOrderStatus(
        req.params.id,
        req.body.status,
        req.user.id,
        req.body.reason
      );
      sendSuccess(res, order, "Order status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const inventory = await AdminService.adjustInventory(
        req.params.variantId,
        req.body.quantityChange,
        req.body.movementType,
        req.user.id,
        req.body.notes
      );
      sendSuccess(res, inventory, "Inventory stock level adjusted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, meta } = await AdminService.listAuditLogs(
        req.query.page as string,
        req.query.limit as string
      );
      sendPaginated(res, data, meta, "Audit logs retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
