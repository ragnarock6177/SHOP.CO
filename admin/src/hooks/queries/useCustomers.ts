import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { toast } from "@/lib/toast";

export interface CustomerItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
  isEmailVerified: boolean;
  ordersCount?: number;
  createdAt: string;
}

export interface CustomerDetail extends CustomerItem {
  addresses?: Array<{
    id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefaultShipping: boolean;
    isDefaultBilling: boolean;
  }>;
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export const useCustomers = (params?: AdminQueryParams) => {
  return usePaginatedQuery<CustomerItem>("customers", "/admin/customers", params);
};

export const useCustomerDetails = (id: string) => {
  return useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CustomerDetail>>(`/admin/customers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CustomerItem["status"] }) => {
      const response = await apiClient.patch<ApiResponse<CustomerItem>>(`/admin/customers/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customers", variables.id] });
      toast.success("Customer Updated", `Status changed to ${variables.status}.`);
    },
  });
};
