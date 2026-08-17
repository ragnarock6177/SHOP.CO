import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendResponse } from "../utils/response.util.js";

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Unified registration / authentication endpoint for email, phone, and google.
   */
  public static async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendResponse(res, 200, "Authentication successful", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login endpoint for email + password authentication.
   */
  public static async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendResponse(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieves authenticated user details.
   */
  public static async me(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      sendResponse(res, 200, "User profile retrieved successfully", {
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Client logout signal.
   */
  public static async logout(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      sendResponse(res, 200, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  public static async checkUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await AuthService.checkUser(req.body);
      sendResponse(res, 200, "User check completed successfully", result);
    } catch (error) {
      next(error);
    }
  }
}



