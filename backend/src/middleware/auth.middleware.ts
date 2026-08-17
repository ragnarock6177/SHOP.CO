import { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service.js";
import { AuthService } from "../services/auth.service.js";
import { UnauthorizedError } from "../utils/apiError.js";

export const authenticateJwt = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authorization header missing or malformed. Standard: Bearer <token>",
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("Authentication token missing.");
    }

    const decoded = JwtService.verifyAccessToken(token);

    const user = await AuthService.getUserProfile(decoded.userId);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
