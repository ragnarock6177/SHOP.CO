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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("airave_admin_user");
        if (cached) return JSON.parse(cached);
      } catch {
        // Ignore parse error
      }
    }
    return null;
  });

  const [permissions, setPermissions] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("airave_admin_user");
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.permissions || [];
        }
      } catch {
        // Ignore parse error
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("airave_admin_token") || localStorage.getItem("token");
      return Boolean(token);
    }
    return true;
  });

  const restoreSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("airave_admin_token") || localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get authenticated user details directly from /auth/me
      const meResp = await apiClient.get<{ success: boolean; message: string; data?: any }>(
        "/auth/me"
      );

      const baseUser = meResp.data?.data?.user ?? meResp.data?.data ?? null;

      if (!meResp.data?.success || !baseUser?.id) {
        throw new Error("Invalid session response from server");
      }

      const isSuperAdmin = Boolean(
        baseUser.isSuperAdmin || baseUser.roles?.includes("SUPER_ADMIN")
      );

      const fullUser: AdminUser = {
        id: baseUser.id,
        email: baseUser.email,
        firstName: baseUser.firstName ?? null,
        lastName: baseUser.lastName ?? null,
        status: baseUser.status ?? "ACTIVE",
        isSuperAdmin,
        roles: baseUser.roles ?? [],
        permissions: baseUser.permissions ?? (isSuperAdmin ? ["*"] : []),
        lastLoginAt: baseUser.lastLoginAt ?? null,
      };

      setUser(fullUser);
      setPermissions(fullUser.permissions);
      localStorage.setItem("airave_admin_user", JSON.stringify(fullUser));
    } catch (error: any) {
      console.warn("Auth session validation error:", error?.message || error);
      // Only wipe session if server explicitly returns 401 Unauthorized
      if (error?.response?.status === 401) {
        localStorage.removeItem("airave_admin_token");
        localStorage.removeItem("token");
        localStorage.removeItem("airave_admin_user");
        setUser(null);
        setPermissions([]);
      }
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

    const isSuperAdmin = Boolean(
      staffUser.isSuperAdmin || staffUser.roles?.includes("SUPER_ADMIN")
    );

    const enriched: AdminUser = {
      ...staffUser,
      isSuperAdmin,
      permissions: staffUser.permissions || (isSuperAdmin ? ["*"] : []),
    };

    setUser(enriched);
    setPermissions(enriched.permissions);
    localStorage.setItem("airave_admin_user", JSON.stringify(enriched));
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
      localStorage.removeItem("airave_admin_user");
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
