import { AdminQueryParams } from "@/types/api";

export interface NormalizedListParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/** Normalize pagination/filter params into stable primitives for query keys & API calls. */
export function normalizeListParams(params?: AdminQueryParams): NormalizedListParams {
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params?.limit) || 10));
  const search = typeof params?.search === "string" ? params.search.trim() : "";
  const status = typeof params?.status === "string" ? params.status.trim() : "";
  const sortBy = typeof params?.sortBy === "string" ? params.sortBy.trim() : "";
  const sortOrder = params?.sortOrder === "asc" ? "asc" : "desc";

  return { page, limit, search, status, sortBy, sortOrder };
}

/** Stable React Query key parts for admin list endpoints. */
export function buildListQueryKey(
  namespace: string,
  params?: AdminQueryParams,
  extra: Array<string | number | boolean> = [],
): (string | number | boolean)[] {
  const p = normalizeListParams(params);
  return [
    "admin",
    namespace,
    p.page,
    p.limit,
    p.search,
    p.status,
    p.sortBy,
    p.sortOrder,
    ...extra,
  ];
}

/** Axios-ready query params (only defined values included). */
export function buildListRequestParams(
  params?: AdminQueryParams,
  extra?: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const p = normalizeListParams(params);
  const request: Record<string, string | number | boolean> = {
    page: p.page,
    limit: p.limit,
  };

  if (p.search) request.search = p.search;
  if (p.status) request.status = p.status;
  if (p.sortBy) request.sortBy = p.sortBy;
  if (p.sortOrder) request.sortOrder = p.sortOrder;

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== undefined && value !== null && value !== "") {
        request[key] = value;
      }
    }
  }

  return request;
}

export const PAGINATED_QUERY_OPTIONS = {
  staleTime: 0,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;
