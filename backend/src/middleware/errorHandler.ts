import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // 1. Custom ApiError Hierarchy
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details);
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      issue: issue.message,
    }));
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request payload or query parameters", details);
  }

  // 3. Prisma Known Request Errors
  if (
    err.name === "PrismaClientInitializationError" ||
    (err.name === "PrismaClientKnownRequestError" &&
      ((err as any).code === "P1001" || (err as any).code === "P1002"))
  ) {
    console.error("[DatabaseError P1001/P1002]: Can't reach database server.", err.message);
    return sendError(
      res,
      503,
      "DATABASE_ERROR",
      "Database server connection temporarily unreachable. Please retry."
    );
  }

  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as any;
    console.error(`[PrismaError ${prismaErr.code}]:`, prismaErr.message, prismaErr.meta);
    if (prismaErr.code === "P2002") {
      const target = Array.isArray(prismaErr.meta?.target)
        ? prismaErr.meta.target.join(", ")
        : "field";
      return sendError(res, 409, "RESOURCE_CONFLICT", `A product or resource with this ${target} already exists.`);
    }
    if (prismaErr.code === "P2003") {
      const field = prismaErr.meta?.field_name || "referenced record";
      return sendError(res, 400, "VALIDATION_ERROR", `Invalid reference: ${field} does not exist in the database.`);
    }
    if (prismaErr.code === "P2023" || prismaErr.code === "P2006") {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid data format or UUID specification.");
    }
    if (prismaErr.code === "P2025") {
      return sendError(res, 404, "NOT_FOUND", "Requested database record was not found.");
    }
  }

  // 4. Log Unexpected Server Error (Never expose raw stack trace to client)
  console.error("Unhandled Internal Server Error:", err);

  return sendError(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected server error occurred. Please try again later."
  );
}
