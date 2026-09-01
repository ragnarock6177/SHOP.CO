import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { sendResponse } from "../utils/response.util.js";
import prisma from "../lib/prisma.js";

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
   * POST /api/v1/auth/firebase-login
   * Firebase Token verification & login/registration flow.
   */
  public static async firebaseLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = req.body.idToken || req.body.firebaseToken;
      const result = await AuthService.register({
        type: "google",
        firebaseToken: token,
      });
      sendResponse(res, 200, "Firebase authentication successful", result);
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
      if (!req.user) {
        sendResponse(res, 401, "Not authenticated");
        return;
      }

      // Fetch full user profile from DB with roles and permissions
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          lastLoginAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  name: true,
                  rolePermissions: {
                    select: {
                      permission: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!dbUser) {
        sendResponse(res, 404, "User not found");
        return;
      }

      const roles = dbUser.userRoles.map((ur) => ur.role.name);
      const isSuperAdmin = roles.includes("SUPER_ADMIN");
      const permissions = isSuperAdmin
        ? ["*"] // Super admins get wildcard
        : [
            ...new Set(
              dbUser.userRoles.flatMap((ur) =>
                ur.role.rolePermissions.map((rp) => rp.permission.name),
              ),
            ),
          ];

      sendResponse(res, 200, "User profile retrieved successfully", {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        status: dbUser.status,
        isSuperAdmin,
        roles,
        permissions,
        lastLoginAt: dbUser.lastLoginAt,
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

  /**
   * POST /api/v1/auth/check-user
   * Checks whether a user exists by email, phone, or identifier.
   */
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
