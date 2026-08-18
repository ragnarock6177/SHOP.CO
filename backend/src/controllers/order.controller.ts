import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service.js";
import { sendSuccess, sendPaginated } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class OrderController {
  static async placeOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.createOrder(
        req.user?.id,
        req.user?.email || undefined,
        req.body
      );
      sendSuccess(res, order, "Order placed successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { data, meta } = await OrderService.getUserOrders(
        req.user.id,
        req.query.page as string,
        req.query.limit as string
      );
      sendPaginated(res, data, meta, "User orders retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getOrderByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.getOrderByNumber(req.params.orderNumber, req.user?.id);
      sendSuccess(res, order, "Order details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const order = await OrderService.cancelOrder(req.params.id, req.user.id);
      sendSuccess(res, order, "Order cancelled successfully");
    } catch (error) {
      next(error);
    }
  }
}
