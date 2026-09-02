import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

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
  return usePaginatedQuery<ReviewItem>("reviews", "/admin/reviews", params);
};

import { toast } from "@/lib/toast";

export const useToggleReviewPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/publish`, { isPublished });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "reviews"] });
      toast.success(variables.isPublished ? "Review Published" : "Review Hidden");
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
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "reviews"] });
      toast.success("Review Deleted", "Customer review was removed.");
    },
  });
};
