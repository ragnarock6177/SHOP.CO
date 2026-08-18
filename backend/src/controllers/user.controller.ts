import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await UserService.getUserById(req.user.id);
      sendSuccess(res, profile, "User profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await UserService.updateUserProfile(req.user.id, req.body);
      sendSuccess(res, updated, "User profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const addresses = await UserService.getUserAddresses(req.user.id);
      sendSuccess(res, addresses, "User addresses retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const address = await UserService.addUserAddress(req.user.id, req.body);
      sendSuccess(res, address, "Address added successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await UserService.softDeleteAddress(req.user.id, req.params.id);
      sendSuccess(res, null, "Address deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
