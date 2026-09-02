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
  isHydrated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readCachedAuth(): {
  user: AdminUser | null;
  permissions: string[];
  isLoading: boolean;
} {
  const token =
    localStorage.getItem("airave_admin_token") || localStorage.getItem("token");

  if (!token) {
    return { user: null, permissions: [], isLoading: false };
  }

  try {
    const cached = localStorage.getItem("airave_admin_user");
    if (cached) {
      const parsed = JSON.parse(cached) as AdminUser;
      return {
        user: parsed,
        permissions: parsed.permissions || [],
        isLoading: false,
      };
    }
  } catch {
    // Ignore invalid cache
  }

  return { user: null, permissions: [], isLoading: true };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  const restoreSession = useCallback(async () => {
    const token =
      localStorage.getItem("airave_admin_token") || localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
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
    const cached = readCachedAuth();
    setUser(cached.user);
    setPermissions(cached.permissions);
    setIsLoading(cached.isLoading);
    setIsHydrated(true);
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
    setIsHydrated(true);
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
        isHydrated,
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
