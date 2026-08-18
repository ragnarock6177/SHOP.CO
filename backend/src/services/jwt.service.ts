import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { JwtPayload } from "../types/auth.types.js";
import { UnauthorizedError } from "../utils/apiError.js";

export class JwtService {
  public static generateAccessToken(user: { id: string; roles?: string[] }): string {
    const payload: JwtPayload = {
      userId: user.id,
      roles: user.roles || ["CUSTOMER"],
    };

    const options: SignOptions = {
      expiresIn: (env.JWT_EXPIRES_IN || "7d") as any,
    };

    return jwt.sign(payload, env.JWT_SECRET || "airave-secret", options);
  }

  public static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET || "airave-secret") as JwtPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedError(
          "Access token has expired. Please log in again.",
        );
      }
      throw new UnauthorizedError("Invalid access token");
    }
  }
}
