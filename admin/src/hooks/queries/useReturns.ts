import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

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
  return useQuery({
    queryKey: ["admin", "returns", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<ReturnRequestItem>>("/admin/returns", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
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
  return useQuery({
    queryKey: ["admin", "refunds", params],
    queryFn: async () => {
      // Refunds are nested under /admin/returns/refunds
      const response = await apiClient.get<ApiPaginatedResponse<any>>("/admin/returns/refunds", { params });
      return response.data;
    },
  });
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
