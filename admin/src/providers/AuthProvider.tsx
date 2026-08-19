"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";
import { ApiResponse } from "../types/api";

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
  const [user, setUser] = useState<AdminUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const restoreSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("airave_admin_token") || localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<AdminUser>>("/auth/me");
      if (response.data.success && response.data.data) {
        const staff = response.data.data;
        setUser(staff);
        setPermissions(staff.permissions || []);
      } else {
        localStorage.removeItem("airave_admin_token");
        localStorage.removeItem("token");
      }
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
    setUser(staffUser);
    setPermissions(staffUser.permissions || []);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore network errors during logout call
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
