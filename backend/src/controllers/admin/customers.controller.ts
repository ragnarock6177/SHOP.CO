import { Request, Response, NextFunction } from "express";
import { AdminCustomersService } from "../../services/admin/customers.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminCustomersController {
  static async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCustomersService.getCustomers(req.query);
      sendAdminPaginated(res, result.customers, result.page, result.limit, result.total, "Customer accounts retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await AdminCustomersService.getCustomerDetails(req.params.id);
      sendAdminSuccess(res, customer, "Customer details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCustomersService.getCustomerOrders(req.params.id, req.query);
      sendAdminPaginated(res, result.orders, result.page, result.limit, result.total, "Customer orders retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomerStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCustomersService.updateCustomerStatus(req.params.id, req.body.status);
      sendAdminSuccess(res, result, "Customer account status updated successfully.");
    } catch (error) {
      next(error);
    }
  }
}
