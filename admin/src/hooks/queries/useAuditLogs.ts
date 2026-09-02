import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

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
  return usePaginatedQuery<AuditLogItem>("auditLogs", "/admin/audit-logs", params);
};
