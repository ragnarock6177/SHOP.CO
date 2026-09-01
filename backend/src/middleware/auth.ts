import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { firebaseApp, getFirebaseAuth } from "../config/firebase.js";
import { env } from "../config/env.js";
import {
  UnauthorizedError,
  ForbiddenError,
  DatabaseError,
} from "../utils/errors.js";
import { AuthUser } from "../types/express.js";

const JWT_SECRET = env.JWT_SECRET || "airave@123454321@airave";

// High-performance in-memory cache for authenticated staff & users (5 min primary TTL, 1 hr stale fallback)
interface CachedAuthUser {
  user: AuthUser;
  expiresAt: number;
  staleUntil: number;
}
const authCache = new Map<string, CachedAuthUser>();

export function invalidateAuthCache(userId?: string) {
  if (userId) {
    authCache.delete(userId);
  } else {
    authCache.clear();
  }
}

function isPrismaDbConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("can't reach database server") ||
    msg.includes("database server") ||
    msg.includes("connection timed out") ||
    msg.includes("p1001") ||
    msg.includes("p1002") ||
    err.code === "P1001" ||
    err.code === "P1002" ||
    err.name === "PrismaClientInitializationError"
  );
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authentication token is missing or malformed",
      );
    }

    const token = authHeader.split(" ")[1];
    let user: AuthUser | null = null;
    let databaseFailure: Error | null = null;

    // 1. Fast local JWT verification FIRST (< 0.1ms)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded?.userId) {
        const cached = authCache.get(decoded.userId);
        if (cached && cached.expiresAt > Date.now()) {
          user = cached.user;
        } else {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                id: true,
                email: true,
                firebaseUid: true,
                status: true,
                userRoles: {
                  select: {
                    role: {
                      select: {
                        name: true,
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

            if (dbUser) {
              const roles = dbUser.userRoles.map((ur) => ur.role.name);
              const isSuperAdmin = roles.includes("SUPER_ADMIN");
              const permissionsSet = new Set<string>();

              for (const ur of dbUser.userRoles) {
                for (const rp of ur.role.rolePermissions) {
                  permissionsSet.add(rp.permission.name);
                }
              }

              user = {
                id: dbUser.id,
                email: dbUser.email,
                firebaseUid: dbUser.firebaseUid,
                status: dbUser.status,
                roles,
                permissions: Array.from(permissionsSet),
                isSuperAdmin,
              };

              authCache.set(dbUser.id, {
                user,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 min fresh TTL
                staleUntil: Date.now() + 60 * 60 * 1000, // 1 hr stale fallback
              });
            }
          } catch (dbErr: any) {
            console.error(
              "[AuthMiddleware] Database query error during JWT auth:",
              dbErr.message || dbErr,
            );
            if (isPrismaDbConnectionError(dbErr)) {
              if (cached && cached.staleUntil > Date.now()) {
                console.warn(
                  `[AuthMiddleware] Database temporary connection failure. Serving cached auth user for ${decoded.userId}.`,
                );
                user = cached.user;
              } else {
                databaseFailure = new DatabaseError(
                  "Database server connection timed out. Please retry.",
                );
              }
            } else {
              throw dbErr;
            }
          }
        }
      }
    } catch (jwtErr: any) {
      if (jwtErr instanceof DatabaseError || databaseFailure) {
        throw databaseFailure || jwtErr;
      }
      // Token signature/format mismatch -> fallback to Firebase
    }

    if (databaseFailure) {
      throw databaseFailure;
    }

    // 2. Firebase ID Token Verification fallback (only if JWT verify didn't match)
    if (!user && firebaseApp) {
      try {
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);
        const cached = authCache.get(decodedToken.uid);
        if (cached && cached.expiresAt > Date.now()) {
          user = cached.user;
        } else {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { firebaseUid: decodedToken.uid },
              select: {
                id: true,
                email: true,
                firebaseUid: true,
                status: true,
                userRoles: {
                  select: {
                    role: {
                      select: {
                        name: true,
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

            if (dbUser) {
              const roles = dbUser.userRoles.map((ur) => ur.role.name);
              const isSuperAdmin = roles.includes("SUPER_ADMIN");
              const permissionsSet = new Set<string>();

              for (const ur of dbUser.userRoles) {
                for (const rp of ur.role.rolePermissions) {
                  permissionsSet.add(rp.permission.name);
                }
              }

              user = {
                id: dbUser.id,
                email: dbUser.email,
                firebaseUid: dbUser.firebaseUid,
                status: dbUser.status,
                roles,
                permissions: Array.from(permissionsSet),
                isSuperAdmin,
              };

              authCache.set(decodedToken.uid, {
                user,
                expiresAt: Date.now() + 5 * 60 * 1000,
                staleUntil: Date.now() + 60 * 60 * 1000,
              });
            }
          } catch (dbErr: any) {
            console.error(
              "[AuthMiddleware] Database query error during Firebase auth:",
              dbErr.message || dbErr,
            );
            if (isPrismaDbConnectionError(dbErr)) {
              if (cached && cached.staleUntil > Date.now()) {
                user = cached.user;
              } else {
                throw new DatabaseError(
                  "Database server connection timed out. Please retry.",
                );
              }
            } else {
              throw dbErr;
            }
          }
        }
      } catch (fbErr: any) {
        if (fbErr instanceof DatabaseError) throw fbErr;
        // Firebase verification failed
      }
    }

    if (!user) {
      throw new UnauthorizedError("Invalid or expired authentication token");
    }

    // 3. User Account Status Guard
    if (
      user.status === "SUSPENDED" ||
      user.status === "BLOCKED" ||
      user.status === "DEACTIVATED"
    ) {
      throw new ForbiddenError(
        `Your account is currently ${user.status.toLowerCase()}. Access denied.`,
      );
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
  next: NextFunction,
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
