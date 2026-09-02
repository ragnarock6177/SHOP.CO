import { useQuery, QueryKey, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { normalizeListParams } from "@/lib/pagination";

type PaginatedQueryKey = readonly [
  "admin-paginated",
  string,
  number,
  number,
  string,
  string,
  string,
  "asc" | "desc",
  ...string[],
];

function buildPaginatedQueryKey(
  namespace: string,
  params?: AdminQueryParams,
  extra: string[] = [],
): PaginatedQueryKey {
  const p = normalizeListParams(params);
  return [
    "admin-paginated",
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

function requestParamsFromQueryKey(queryKey: QueryKey): Record<string, string | number> {
  const [, , page, limit, search, status, sortBy, sortOrder] = queryKey as PaginatedQueryKey;

  const request: Record<string, string | number> = {
    page: Number(page),
    limit: Number(limit),
  };

  if (search) request.search = String(search);
  if (status) request.status = String(status);
  if (sortBy) request.sortBy = String(sortBy);
  if (sortOrder) request.sortOrder = String(sortOrder);

  return request;
}

/**
 * Fetches a paginated admin list. Page/limit are read from queryKey inside queryFn
 * so fetches always match the active page (no stale closure bugs).
 */
export function usePaginatedQuery<T>(
  namespace: string,
  endpoint: string,
  params?: AdminQueryParams,
  extraKey: string[] = [],
) {
  const queryKey = buildPaginatedQueryKey(namespace, params, extraKey);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: key }) => {
      const response = await apiClient.get<ApiPaginatedResponse<T>>(endpoint, {
        params: requestParamsFromQueryKey(key),
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      return response.data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });
}

export { buildPaginatedQueryKey };
