import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";

export interface StaffUserItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
  isSuperAdmin: boolean;
  roles?: Array<{ id: string; name: string }>;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions?: string[];
  createdAt: string;
}

export const useStaffUsers = (params?: AdminQueryParams) => {
  return useQuery({
    queryKey: ["admin", "staff", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<StaffUserItem>>("/staff", { params });
      return response.data;
    },
    staleTime: 30 * 1000,
  });
};

export const useCreateStaffUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiClient.post<ApiResponse<StaffUserItem>>("/staff", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<RoleItem>>("/roles");
      return response.data.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; permissions: string[] }) => {
      const response = await apiClient.post<ApiResponse<RoleItem>>("/roles", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const response = await apiClient.put<ApiResponse<RoleItem>>(`/roles/${roleId}/permissions`, { permissions });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    },
  });
};
