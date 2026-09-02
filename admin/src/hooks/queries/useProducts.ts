import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

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
  primaryImage?: string | null;
  primaryCategory?: { id: string; name: string };
  images?: Array<{ id: string; imageUrl: string; altText: string | null; sortOrder: number; isPrimary: boolean }>;
  variants?: any[];
  createdAt: string;
  updatedAt: string;
}

export const useProducts = (params?: AdminQueryParams) => {
  return usePaginatedQuery<ProductItem>("products", "/admin/products", params);
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ["admin", "products", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProductItem>>(`/admin/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { primaryCategoryId, comparePrice, basePrice, images, id, ...rest } = payload;
      
      const cleanComparePrice =
        comparePrice !== undefined && comparePrice !== null && !isNaN(Number(comparePrice))
          ? Number(comparePrice)
          : undefined;

      const cleanBasePrice =
        basePrice !== undefined && basePrice !== null && !isNaN(Number(basePrice))
          ? Number(basePrice)
          : 0;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const cleanId = id && typeof id === "string" && uuidRegex.test(id) ? id : undefined;

      const cleanImages = Array.isArray(images)
        ? images.filter((img: any) => img && img.imageUrl && !img.imageUrl.startsWith("blob:"))
        : undefined;

      const apiPayload = {
        ...rest,
        ...(cleanId ? { id: cleanId } : {}),
        basePrice: cleanBasePrice,
        ...(cleanComparePrice !== undefined ? { compareAtPrice: cleanComparePrice } : {}),
        ...(primaryCategoryId && uuidRegex.test(primaryCategoryId) ? { categoryId: primaryCategoryId } : {}),
        ...(cleanImages && cleanImages.length > 0 ? { images: cleanImages } : {}),
        ...(payload.variants && payload.variants.length > 0 ? { variants: payload.variants } : {}),
      };

      const response = await apiClient.post<ApiResponse<ProductItem>>("/admin/products", apiPayload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
    },
  });
};

export const useAddVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const response = await apiClient.post<ApiResponse<ProductItem>>(`/admin/products/${productId}/variants`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.productId] });
    },
  });
};

export const useUpdateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, variantId, data }: { productId: string; variantId: string; data: any }) => {
      const response = await apiClient.put<ApiResponse<ProductItem>>(`/admin/products/${productId}/variants/${variantId}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.productId] });
    },
  });
};

export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, variantId }: { productId: string; variantId: string }) => {
      const response = await apiClient.delete<ApiResponse<any>>(`/admin/products/${productId}/variants/${variantId}`);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.productId] });
    },
  });
};

