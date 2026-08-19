import { Request, Response, NextFunction } from "express";
import { AdminUsersService } from "../../services/admin/adminUsers.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminUsersController {
  static async getAdminUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminUsersService.getAdminUsers(req.query);
      sendAdminPaginated(
        res,
        result.users,
        result.page,
        result.limit,
        result.total,
        "Admin user staff accounts retrieved successfully."
      );
    } catch (error) {
      next(error);
    }
  }

  static async createAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actingRoles = req.user?.roles || [];
      const user = await AdminUsersService.createAdminUser(req.body, actingRoles);
      sendAdminSuccess(res, user, "Admin user staff account created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actingRoles = req.user?.roles || [];
      const user = await AdminUsersService.updateAdminUser(req.params.id, req.body, actingRoles);
      sendAdminSuccess(res, user, "Admin user staff account updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AdminUsersService.updateUserStatus(req.params.id, req.body.status);
      sendAdminSuccess(res, user, `User status updated to '${req.body.status}' successfully.`, 200);
    } catch (error) {
      next(error);
    }
  }
}
