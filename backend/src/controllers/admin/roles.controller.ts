import { Request, Response, NextFunction } from "express";
import { RolesService } from "../../services/admin/roles.service.js";
import { sendAdminSuccess } from "../../utils/adminResponse.js";

export class RolesController {
  static async getRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = await RolesService.getRoles();
      sendAdminSuccess(res, roles, "System roles retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getPermissions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await RolesService.getPermissions();
      sendAdminSuccess(res, permissions, "System permissions directory retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await RolesService.getRoleById(req.params.id);
      sendAdminSuccess(res, role, "Role details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await RolesService.createRole(req.body);
      sendAdminSuccess(res, role, "System role created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await RolesService.updateRole(req.params.id, req.body);
      sendAdminSuccess(res, role, "System role updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }
}
