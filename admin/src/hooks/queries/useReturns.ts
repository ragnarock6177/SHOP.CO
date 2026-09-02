import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

export interface ReturnRequestItem {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber?: string;
  customerEmail: string;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "COMPLETED";
  refundAmount: number;
  createdAt: string;
}

export const useReturns = (params?: AdminQueryParams) => {
  return usePaginatedQuery<ReturnRequestItem>("returns", "/admin/returns", params);
};

export const useUpdateReturnStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: ReturnRequestItem["status"]; notes?: string }) => {
      const response = await apiClient.patch<ApiResponse<ReturnRequestItem>>(`/admin/returns/${id}/status`, { status, notes });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useRefunds = (params?: AdminQueryParams) => {
  return usePaginatedQuery<any>("refunds", "/admin/returns/refunds", params);
};

export const useProcessRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orderId: string; amount: number; reason: string }) => {
      const response = await apiClient.post<ApiResponse<any>>("/admin/returns/refunds", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};
