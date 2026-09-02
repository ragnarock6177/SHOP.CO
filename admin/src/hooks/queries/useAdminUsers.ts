import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ApiResponse, ApiPaginatedResponse, AdminQueryParams } from "@/types/api";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";

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
  return usePaginatedQuery<StaffUserItem>("staff", "/admin/admin-users", params);
};

import { toast } from "@/lib/toast";

export const useCreateStaffUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiClient.post<ApiResponse<StaffUserItem>>("/admin/admin-users", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
      queryClient.invalidateQueries({ queryKey: ["admin-paginated", "staff"] });
      toast.success("Staff Member Created", "Staff user provisioned successfully.");
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const response = await apiClient.get<ApiPaginatedResponse<RoleItem>>("/admin/roles");
      return response.data.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; permissions: string[] }) => {
      const response = await apiClient.post<ApiResponse<RoleItem>>("/admin/roles", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      toast.success("Role Created", "Security role created successfully.");
    },
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const response = await apiClient.put<ApiResponse<RoleItem>>(`/admin/roles/${roleId}/permissions`, { permissions });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      toast.success("Permissions Updated", "Role permissions updated successfully.");
    },
  });
};
