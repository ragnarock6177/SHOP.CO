import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { firebaseApp, getFirebaseAuth } from "../config/firebase.js";
import { env } from "../config/env.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { AuthUser } from "../types/express.js";

const JWT_SECRET = env.JWT_SECRET || "airave@123454321@airave";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    let user: AuthUser | null = null;

    // 1. Try Firebase Admin ID Token Verification first if Firebase initialized
    if (firebaseApp) {
      try {
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);
        const dbUser = await prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            firebaseUid: dbUser.firebaseUid,
            status: dbUser.status,
            roles: dbUser.userRoles.map((ur) => ur.role.name),
          };
        }
      } catch {
        // Fallback to JWT verification if Firebase verification fails
      }
    }

    // 2. JWT Verification Fallback
    if (!user) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            userRoles: {
              include: { role: true },
            },
          },
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            firebaseUid: dbUser.firebaseUid,
            status: dbUser.status,
            roles: dbUser.userRoles.map((ur) => ur.role.name),
          };
        }
      } catch {
        throw new UnauthorizedError("Invalid or expired authentication token");
      }
    }

    if (!user) {
      throw new UnauthorizedError("User profile associated with token not found");
    }

    // 3. User Account Status Guard
    if (user.status === "SUSPENDED" || user.status === "BLOCKED" || user.status === "DEACTIVATED") {
      throw new ForbiddenError(`Your account is currently ${user.status.toLowerCase()}. Access denied.`);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const guestHeader = req.headers["x-guest-token"];

  if (guestHeader && typeof guestHeader === "string") {
    req.guestToken = guestHeader;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      await authenticate(req, _res, () => {});
    } catch {
      // Ignore auth errors for optionalAuth routes
    }
  }

  next();
}
