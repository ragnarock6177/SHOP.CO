import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, DashboardMetrics } from "@/types/api";

export const useDashboard = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ["admin", "dashboard", { fromDate, toDate }],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await apiClient.get<ApiResponse<DashboardMetrics>>("/dashboard", { params });
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
};

export default useDashboard;
