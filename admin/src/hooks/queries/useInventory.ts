import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { toast } from "@/lib/toast";

export interface InventoryItem {
  variantId: string;
  sku: string;
  barcode: string | null;
  productName: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface StockAdjustPayload {
  variantId: string;
  movementType: "PURCHASE" | "ADJUSTMENT" | "DAMAGE" | "LOSS" | "RETURN";
  quantityChange: number;
  notes?: string;
}

export const useInventory = (params?: AdminQueryParams) => {
  return usePaginatedQuery<InventoryItem>("inventory", "/admin/inventory", params);
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StockAdjustPayload) => {
      const response = await apiClient.post<ApiResponse<InventoryItem>>("/admin/inventory/adjust", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Stock Adjusted", "Inventory levels updated successfully.");
    },
  });
};

export const useInventoryMovements = (params?: AdminQueryParams) => {
  return usePaginatedQuery<any>("inventory", "/admin/inventory/movements", params, ["movements"]);
};

export const useInventoryReservations = (params?: AdminQueryParams) => {
  return usePaginatedQuery<any>("inventory", "/admin/inventory/reservations", params, ["reservations"]);
};

export const useReleaseReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservationId: string) => {
      const response = await apiClient.post<ApiResponse<any>>(`/admin/inventory/reservations/${reservationId}/release`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      toast.success("Hold Released", "Stock reservation has been released back to available inventory.");
    },
    onError: (err: any) => {
      toast.error("Release Failed", err.response?.data?.message || "Failed to release reservation.");
    },
  });
};

export const useSweepExpiredReservations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<{ releasedCount: number }>>("/admin/inventory/reservations/sweep-expired");
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      toast.success("Reservations Swept", `Successfully released ${data?.releasedCount ?? 0} expired hold(s).`);
    },
    onError: (err: any) => {
      toast.error("Sweep Failed", err.response?.data?.message || "Failed to sweep expired reservations.");
    },
  });
};
