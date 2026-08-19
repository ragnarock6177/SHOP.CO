"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "@/lib/apiClient";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED";
  isSuperAdmin: boolean;
  roles: string[];
  permissions: string[];
  lastLoginAt: string | null;
}

export interface AuthContextType {
  user: AdminUser | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch full admin user profile by ID.
 * Falls back to a minimal object constructed from the basic /auth/me response.
 */
async function fetchFullProfile(userId: string): Promise<Partial<AdminUser>> {
  try {
    const resp = await apiClient.get<{ success: boolean; data: any }>(`/admin/admin-users/${userId}`);
    if (resp.data.success && resp.data.data) {
      const u = resp.data.data;
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        status: u.status,
        isSuperAdmin: u.roles?.includes("SUPER_ADMIN") ?? false,
        roles: u.roles ?? [],
        permissions: u.permissions ?? [],
        lastLoginAt: u.lastLoginAt ?? null,
      };
    }
  } catch {
    // Fall through — return empty so caller uses base data
  }
  return {};
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const restoreSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("airave_admin_token") || localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Get basic auth context (verifies the token is still valid)
      const meResp = await apiClient.get<{ success: boolean; message: string; data?: { user?: any } }>(
        "/auth/me"
      );

      // The /auth/me response shape is: { success, message, data: { user: { id, email, status, roles } } }
      const baseUser =
        meResp.data?.data?.user ?? meResp.data?.data ?? null;

      if (!meResp.data.success || !baseUser?.id) {
        throw new Error("Invalid session response");
      }

      // 2. Fetch full admin profile to get firstName, lastName, isSuperAdmin, permissions
      const extraProfile = await fetchFullProfile(baseUser.id);

      const fullUser: AdminUser = {
        id: baseUser.id,
        email: baseUser.email,
        firstName: extraProfile.firstName ?? null,
        lastName: extraProfile.lastName ?? null,
        status: baseUser.status ?? "ACTIVE",
        isSuperAdmin:
          extraProfile.isSuperAdmin ??
          baseUser.roles?.includes("SUPER_ADMIN") ??
          false,
        roles: extraProfile.roles ?? baseUser.roles ?? [],
        permissions: extraProfile.permissions ?? [],
        lastLoginAt: extraProfile.lastLoginAt ?? null,
      };

      setUser(fullUser);
      setPermissions(fullUser.permissions);
    } catch (error) {
      console.warn("Failed to restore admin auth session:", error);
      localStorage.removeItem("airave_admin_token");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback((token: string, staffUser: AdminUser) => {
    
    localStorage.setItem("airave_admin_token", token);
    localStorage.setItem("token", token);
    // Enrich isSuperAdmin from roles array if not explicitly set
    const enriched: AdminUser = {
      ...staffUser,
      isSuperAdmin:
        staffUser.isSuperAdmin ??
        staffUser.roles?.includes("SUPER_ADMIN") ??
        false,
      permissions: staffUser.permissions ?? [],
    };
    setUser(enriched);
    setPermissions(enriched.permissions);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors during logout API call
    } finally {
      localStorage.removeItem("airave_admin_token");
      localStorage.removeItem("token");
      setUser(null);
      setPermissions([]);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refetchUser: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
