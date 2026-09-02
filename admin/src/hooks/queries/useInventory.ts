import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

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
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
};

export const useInventoryMovements = (params?: AdminQueryParams) => {
  return usePaginatedQuery<any>("inventory", "/admin/inventory/movements", params, ["movements"]);
};

export const useInventoryReservations = (params?: AdminQueryParams) => {
  return usePaginatedQuery<any>("inventory", "/admin/inventory/reservations", params, ["reservations"]);
};
