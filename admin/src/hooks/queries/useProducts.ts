import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  comparePrice: number | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  primaryCategoryId: string;
  primaryCategory?: { id: string; name: string };
  images?: Array<{ id: string; url: string; altText: string | null; sortOrder: number; isPrimary: boolean }>;
  variants?: any[];
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<ProductItem>>("/admin/products", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ["admin", "products", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProductItem>>(`/admin/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiClient.post<ApiResponse<ProductItem>>("/admin/products", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put<ApiResponse<ProductItem>>(`/admin/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.id] });
    },
  });
};

export const useArchiveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ archived: boolean }>>(`/admin/products/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};
