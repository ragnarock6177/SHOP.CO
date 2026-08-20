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
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (typeof val === "number") return Math.max(1, Math.floor(val));
        if (typeof val === "string") {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) || parsed < 1 ? 1 : parsed;
        }
        return 1;
      })
      .pipe(z.number().int().min(1))
      .catch(1),
    limit: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (typeof val === "number") return Math.min(100, Math.max(1, Math.floor(val)));
        if (typeof val === "string") {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) || parsed < 1 ? 10 : Math.min(100, parsed);
        }
        return 10;
      })
      .pipe(z.number().int().min(1).max(100))
      .catch(10),
    sortBy: z
      .any()
      .optional()
      .transform((val) => (typeof val === "string" && allowedSortColumns.includes(val) ? val : defaultSortColumn)),
    sortOrder: z
      .any()
      .optional()
      .transform((val) => (val === "asc" ? "asc" : "desc")),
    search: z
      .any()
      .optional()
      .transform((val) => (typeof val === "string" && val.trim() ? val.trim() : undefined)),
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
