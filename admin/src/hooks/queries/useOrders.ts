import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { toast } from "@/lib/toast";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED";

export interface OrderAddress {
  type?: string;
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string | null;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  userId: string | null;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  currency?: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentProvider: string | null;
  shipmentStatus?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  itemCount: number;
  lineItemCount: number;
  previewItemName?: string | null;
  placedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderLineItem {
  id: string;
  sku: string;
  productName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  imageUrl?: string | null;
}

export interface OrderStatusHistoryEntry {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  changedBy: string | null;
  changedByName?: string | null;
  changedByEmail?: string | null;
  reason: string | null;
  createdAt: string;
}

export interface OrderPaymentSummary {
  id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  capturedAt?: string | null;
  createdAt: string;
}

export interface OrderShipmentSummary {
  id: string;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface OrderInvoiceSummary {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  issuedAt?: string | null;
  paidAt?: string | null;
}

export interface OrderDetail extends OrderListItem {
  notes?: string | null;
  shippingAddress?: OrderAddress | null;
  billingAddress?: OrderAddress | null;
  items?: OrderLineItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  primaryPayment?: OrderPaymentSummary | null;
  primaryShipment?: OrderShipmentSummary | null;
  payments?: OrderPaymentSummary[];
  shipments?: OrderShipmentSummary[];
  invoice?: OrderInvoiceSummary | null;
}

/** @deprecated Use OrderListItem */
export type OrderItem = OrderListItem;

export const useOrders = (params?: AdminQueryParams) => {
  return usePaginatedQuery<OrderListItem>("orders", "/admin/orders", params);
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
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: OrderStatus;
      reason?: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<OrderDetail>>(
        `/admin/orders/${id}/status`,
        { status, reason },
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] });
      toast.success("Order Updated", `Status changed to ${variables.status}.`);
    },
  });
};
