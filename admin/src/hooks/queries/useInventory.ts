import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

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
  return useQuery({
    queryKey: ["admin", "inventory", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<InventoryItem>>("/admin/inventory", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
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
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useInventoryMovements = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "inventory", "movements", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<any>>("/admin/inventory/movements", { params });
      return response.data;
    },
  });
};

export const useInventoryReservations = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "inventory", "reservations", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<any>>("/admin/inventory/reservations", { params });
      return response.data;
    },
  });
};
