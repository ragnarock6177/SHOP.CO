import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse } from "@/types/api";

export interface AttributeValueItem {
  id: string;
  attributeId: string;
  value: string;
  slug: string;
  colorHex: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface AttributeItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isVariantAttribute: boolean;
  isFilterable: boolean;
  isVisible: boolean;
  sortOrder: number;
  values: AttributeValueItem[];
  createdAt?: string;
  updatedAt?: string;
}

export function useAttributes() {
  return useQuery({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<AttributeItem[]>>("/admin/attributes");
      return res.data.data;
    },
  });
}

export function useCreateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      slug: string;
      description?: string;
      isVariantAttribute?: boolean;
      isFilterable?: boolean;
      isVisible?: boolean;
    }) => {
      const res = await apiClient.post<ApiResponse<AttributeItem>>("/admin/attributes", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      name?: string;
      slug?: string;
      description?: string;
      isVariantAttribute?: boolean;
      isFilterable?: boolean;
      isVisible?: boolean;
    }) => {
      const res = await apiClient.put<ApiResponse<AttributeItem>>(`/admin/attributes/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/attributes/${id}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useAddAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      attributeId,
      ...payload
    }: {
      attributeId: string;
      value: string;
      slug: string;
      colorHex?: string | null;
      imageUrl?: string | null;
    }) => {
      const res = await apiClient.post<ApiResponse<AttributeValueItem>>(
        `/admin/attributes/${attributeId}/values`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useUpdateAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      valueId,
      ...payload
    }: {
      valueId: string;
      value?: string;
      slug?: string;
      colorHex?: string | null;
      imageUrl?: string | null;
    }) => {
      const res = await apiClient.put<ApiResponse<AttributeValueItem>>(
        `/admin/attributes/values/${valueId}`,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useDeleteAttributeValue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (valueId: string) => {
      const res = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/admin/attributes/values/${valueId}`
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}
