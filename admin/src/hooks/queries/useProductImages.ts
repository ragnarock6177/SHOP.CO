import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  storagePath: string;
}

const imageQueryKey = (productId: string) => ["admin", "products", productId, "images"];

// ── Queries ───────────────────────────────────────────────────────────────────

export const useProductImages = (productId: string) =>
  useQuery({
    queryKey: imageQueryKey(productId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<ProductImage[]>>(
        `/admin/products/${productId}/images`
      );
      return res.data.data;
    },
    enabled: !!productId,
    staleTime: 10 * 1000,
  });

// ── Presign URL ───────────────────────────────────────────────────────────────

export const usePresignUpload = () =>
  useMutation({
    mutationFn: async (payload: {
      productId: string;
      fileName: string;
      mimeType: string;
    }) => {
      const res = await apiClient.post<ApiResponse<PresignResult>>(
        "/admin/upload/presign",
        payload
      );
      return res.data.data;
    },
  });

// ── Add image (register URL in DB after upload) ───────────────────────────────

export const useAddProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      imageUrl: string;
      altText?: string;
      isPrimary?: boolean;
    }) => {
      const res = await apiClient.post<ApiResponse<ProductImage>>(
        `/admin/products/${productId}/images`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageQueryKey(productId) });
    },
  });
};

// ── Update image (alt text, primary, sort order) ──────────────────────────────

export const useUpdateProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      imageId,
      data,
    }: {
      imageId: string;
      data: { altText?: string; isPrimary?: boolean; sortOrder?: number };
    }) => {
      const res = await apiClient.patch<ApiResponse<ProductImage>>(
        `/admin/products/${productId}/images/${imageId}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageQueryKey(productId) });
    },
  });
};

// ── Delete image ──────────────────────────────────────────────────────────────

export const useDeleteProductImage = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string) => {
      const res = await apiClient.delete<ApiResponse<{ id: string; deleted: boolean }>>(
        `/admin/products/${productId}/images/${imageId}`
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageQueryKey(productId) });
    },
  });
};

// ── Reorder images ────────────────────────────────────────────────────────────

export const useReorderProductImages = (productId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const res = await apiClient.put<ApiResponse<ProductImage[]>>(
        `/admin/products/${productId}/images/reorder`,
        { orderedIds }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageQueryKey(productId) });
    },
  });
};
