import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.name === "SyntaxError" && "body" in err) {
    statusCode = 400;
    message = "Invalid JSON request payload format.";
  }

  const isProduction = env.NODE_ENV === "production";

  if (!isProduction && statusCode === 500) {
    console.error("🔥 [Unhandled Error]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.error && { error: err.error }),
    ...(!isProduction && err.stack && { stack: err.stack }),
  });
};
