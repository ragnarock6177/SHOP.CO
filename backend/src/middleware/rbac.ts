import { Request, Response, NextFunction } from "express";
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
