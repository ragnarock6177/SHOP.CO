import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../utils/errors.js";

export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError("Access denied. You do not have the required role."));
    }

    next();
  };
}

export function requireOwnershipOrRole(paramIdKey = "id", allowedRoles = ["ADMIN", "SUPER_ADMIN"]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const targetUserId = req.params[paramIdKey] || req.body[paramIdKey];
    const isOwner = req.user.id === targetUserId;
    const hasAdminRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!isOwner && !hasAdminRole) {
      return next(new ForbiddenError("Access denied. You can only manage your own resources."));
    }

    next();
  };
}

/**
 * Granular RBAC Permission Middleware
 * 
 * Verifies that the authenticated user possesses the specified permission capability.
 * `SUPER_ADMIN` role automatically grants all permission capabilities.
 */
export function requirePermission(requiredPermission: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError("Authentication required"));
      }

      // SUPER_ADMIN role bypasses granular permission check
      if (req.user.roles.includes("SUPER_ADMIN") || (req.user as any).isSuperAdmin) {
        return next();
      }

      // Fast check: Use preloaded permissions from authenticate middleware (0ms)
      if (Array.isArray(req.user.permissions)) {
        if (req.user.permissions.includes(requiredPermission) || req.user.permissions.includes("*")) {
          return next();
        }
        return next(
          new ForbiddenError(`Access denied. Missing required permission: '${requiredPermission}'`)
        );
      }

      // Fallback: Query user's assigned role permissions from database if not preloaded
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          userRoles: {
            select: {
              role: {
                select: {
                  rolePermissions: {
                    select: {
                      permission: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!dbUser) {
        return next(new UnauthorizedError("User profile not found"));
      }

      const userPermissions = new Set<string>();
      for (const ur of dbUser.userRoles) {
        for (const rp of ur.role.rolePermissions) {
          userPermissions.add(rp.permission.name);
        }
      }

      if (!userPermissions.has(requiredPermission)) {
        return next(
          new ForbiddenError(`Access denied. Missing required permission: '${requiredPermission}'`)
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
