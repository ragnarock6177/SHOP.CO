import { Response } from "express";
import { sendSuccess, sendError } from "./response.js";

export interface AdminPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Sends a standardized Admin Paginated List Response:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 150,
 *     "totalPages": 8
 *   }
 * }
 */
export function sendAdminPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  statusCode = 200
): Response {
  const totalPages = Math.ceil(total / (limit || 1)) || 1;
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    ...(message ? { message } : {}),
  });
}

/**
 * Sends a standardized Admin Single Object Response
 */
export function sendAdminSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response {
  return sendSuccess(res, data, message, statusCode);
}

/**
 * Sends a standardized Admin Error Response
 */
export function sendAdminError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: any
): Response {
  return sendError(res, statusCode, code, message, details);
}
