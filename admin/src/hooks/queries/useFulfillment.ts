import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

export interface ShipmentItem {
  id: string;
  orderId: string;
  orderNumber?: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
  status: "PENDING" | "SHIPPED" | "DELIVERED";
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export const useShipments = (params?: AdminQueryParams) => {
  return usePaginatedQuery<ShipmentItem>("fulfillment", "/admin/fulfillment", params);
};

import { toast } from "@/lib/toast";

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { orderId: string; carrier: string; trackingNumber: string; trackingUrl?: string; items?: any[] }) => {
      const response = await apiClient.post<ApiResponse<ShipmentItem>>("/admin/fulfillment", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fulfillment"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "fulfillment"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Shipment Created", "Tracking information recorded.");
    },
  });
};

export const useUpdateShipmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ShipmentItem["status"] }) => {
      const response = await apiClient.patch<ApiResponse<ShipmentItem>>(`/admin/fulfillment/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fulfillment"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "fulfillment"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Shipment Updated", `Shipment marked as ${variables.status}`);
    },
  });
};
