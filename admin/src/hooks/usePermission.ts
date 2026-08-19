import { useAuth } from "./useAuth";

export const usePermission = (requiredPermission?: string): { hasPermission: boolean; isSuperAdmin: boolean } => {
  const { user, permissions } = useAuth();

  const isSuperAdmin = !!user?.isSuperAdmin;

  if (isSuperAdmin || !requiredPermission) {
    return { hasPermission: true, isSuperAdmin };
  }

  const hasPermission = permissions.includes(requiredPermission);
  return { hasPermission, isSuperAdmin };
};

export default usePermission;
