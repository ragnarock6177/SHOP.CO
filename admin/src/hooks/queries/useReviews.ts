import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export interface ReviewItem {
  id: string;
  productId: string;
  productName?: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string | null;
  comment: string;
  isPublished: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export const useReviews = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "reviews", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<ReviewItem>>("/admin/reviews", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useToggleReviewPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/publish`, { isPublished });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(`/admin/reviews/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });
};
