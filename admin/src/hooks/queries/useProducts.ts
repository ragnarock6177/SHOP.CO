import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  careInstructions: string | null;
  productType: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE" | "HIDDEN";
  metaTitle: string | null;
  metaDescription: string | null;
  primaryCategory?: { id: string; name: string };
  images?: Array<{ id: string; imageUrl: string; altText: string | null; sortOrder: number; isPrimary: boolean }>;
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
      // Map form field names to API field names
      const { primaryCategoryId, comparePrice, ...rest } = payload;
      const apiPayload = {
        ...rest,
        ...(primaryCategoryId ? { categoryId: primaryCategoryId } : {}),
        ...(comparePrice !== undefined ? { compareAtPrice: comparePrice } : {}),
      };
      const response = await apiClient.post<ApiResponse<ProductItem>>("/admin/products", apiPayload);
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
