import { z } from "zod";

export interface ParsedAdminQueryParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search?: string;
  skip: number;
}

/**
 * Creates a Zod schema for validating and sanitizing administrative list query parameters.
 * Enforces pagination limits (max limit = 100) and column sorting whitelists.
 */
export function createAdminQuerySchema(
  allowedSortColumns: string[] = ["createdAt", "updatedAt", "id"],
  defaultSortColumn: string = "createdAt"
) {
  return z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1))
      .catch(1),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .pipe(z.number().int().min(1).max(100))
      .catch(20),
    sortBy: z
      .string()
      .optional()
      .transform((val) => (val && allowedSortColumns.includes(val) ? val : defaultSortColumn)),
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .transform((val) => (val === "asc" ? "asc" : "desc")),
    search: z
      .string()
      .optional()
      .transform((val) => (val ? val.trim() : undefined)),
  });
}

/**
 * Helper to parse, sanitize, and extract pagination offsets from raw request query objects.
 */
export function parseAdminQueryParams(
  rawQuery: Record<string, any>,
  allowedSortColumns: string[] = ["createdAt", "updatedAt", "id"],
  defaultSortColumn: string = "createdAt"
): ParsedAdminQueryParams {
  const schema = createAdminQuerySchema(allowedSortColumns, defaultSortColumn);
  const parsed = schema.parse(rawQuery);
  const skip = (parsed.page - 1) * parsed.limit;

  return {
    page: parsed.page,
    limit: parsed.limit,
    sortBy: parsed.sortBy,
    sortOrder: parsed.sortOrder,
    search: parsed.search,
    skip,
  };
}
