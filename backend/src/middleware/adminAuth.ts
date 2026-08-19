import { Request, Response, NextFunction } from "express";
import { authenticate } from "./auth.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

/**
 * Admin Authentication & Status Guard Middleware
 * 
 * Verifies active JWT/Firebase authentication and enforces strict active status (`req.user.status === 'ACTIVE'`).
 * Blocks unauthenticated requests with 401 Unauthorized and inactive/blocked/pending/suspended users with 403 Forbidden.
 */
export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await authenticate(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }

    if (!req.user) {
      return next(new UnauthorizedError("Administrative authentication required"));
    }

    if (req.user.status !== "ACTIVE") {
      return next(
        new ForbiddenError(
          `Administrative access denied. Your account status is '${req.user.status}'. Account must be 'ACTIVE'.`
        )
      );
    }

    next();
  });
}

export default requireAdminAuth;
