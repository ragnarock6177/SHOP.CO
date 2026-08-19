import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderDetail extends OrderItem {
  shippingAddress?: any;
  billingAddress?: any;
  items?: Array<{
    id: string;
    sku: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalAmount: number;
  }>;
  statusHistory?: Array<{
    id: string;
    oldStatus: string | null;
    newStatus: string;
    changedBy: string | null;
    reason: string | null;
    createdAt: string;
  }>;
}

export const useOrders = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<OrderItem>>("/admin/orders", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useOrderDetails = (id: string) => {
  return useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OrderDetail>>(`/admin/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: OrderStatus; reason?: string }) => {
      const response = await apiClient.patch<ApiResponse<OrderDetail>>(`/admin/orders/${id}/status`, { status, reason });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
    },
  });
};
