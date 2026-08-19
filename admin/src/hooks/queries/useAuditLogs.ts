import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const useAuditLogs = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "auditLogs", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<AuditLogItem>>("/admin/audit-logs", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};
