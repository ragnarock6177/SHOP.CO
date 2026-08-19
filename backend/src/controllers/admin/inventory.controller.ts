import { Request, Response, NextFunction } from "express";
import { AdminInventoryService } from "../../services/admin/inventory.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminInventoryController {
  static async getInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminInventoryService.getInventory(req.query);
      sendAdminPaginated(res, result.inventory, result.page, result.limit, result.total, "Inventory balances retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async adjustInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.id;
      const result = await AdminInventoryService.adjustInventory(req.body, adminUserId);
      sendAdminSuccess(res, result, "Stock adjustment completed successfully.", 200);
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminInventoryService.getInventoryMovements(req.query);
      sendAdminPaginated(res, result.movements, result.page, result.limit, result.total, "Inventory movement logs retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryReservations(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservations = await AdminInventoryService.getInventoryReservations();
      sendAdminSuccess(res, reservations, "Active inventory reservations retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async updateReorderLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminInventoryService.updateReorderLevel(req.params.variantId, req.body.reorderLevel);
      sendAdminSuccess(res, result, "Reorder level threshold updated successfully.");
    } catch (error) {
      next(error);
    }
  }
}
