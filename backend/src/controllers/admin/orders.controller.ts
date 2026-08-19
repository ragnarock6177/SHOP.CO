import { Request, Response, NextFunction } from "express";
import { AdminOrdersService } from "../../services/admin/orders.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminOrdersController {
  static async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminOrdersService.getOrders(req.query);
      sendAdminPaginated(res, result.orders, result.page, result.limit, result.total, "Orders list retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getOrderDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await AdminOrdersService.getOrderDetails(req.params.id);
      sendAdminSuccess(res, order, "Order details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.id;
      const order = await AdminOrdersService.updateOrderStatus(
        req.params.id,
        req.body.status,
        adminUserId,
        req.body.notes
      );
      sendAdminSuccess(res, order, `Order status updated to '${req.body.status}' successfully.`);
    } catch (error) {
      next(error);
    }
  }

  static async getOrderStatusHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await AdminOrdersService.getOrderStatusHistory(req.params.id);
      sendAdminSuccess(res, history, "Order status history timeline retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }
}
