"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { SanitizedUser, AuthResponseData, getMeApi, logoutApi, ApiHttpError } from "@/lib/authApi";
import { syncAuthCookie } from "@/lib/authSession";

interface AuthContextType {
  user: SanitizedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  saveAuth: (authData: AuthResponseData) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SanitizedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
          syncAuthCookie(storedToken);
          setToken(storedToken);

          if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.warn("Invalid stored user in localStorage, clearing:", e);
              localStorage.removeItem("user");
            }
          }

          try {
            const { user: freshUser } = await getMeApi(storedToken);
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem("user", JSON.stringify(freshUser));
            }
          } catch (apiErr: unknown) {
            // ONLY log out if the backend explicitly returns a 401 Unauthorized / Token Expired error!
            if (apiErr instanceof ApiHttpError && apiErr.status === 401) {
              console.warn("Session expired on server (401), clearing auth state");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("user");
              syncAuthCookie(null);
              setToken(null);
              setUser(null);
            } else {
              const errMsg = apiErr instanceof Error ? apiErr.message : "Unknown error";
              console.warn("Could not refresh user profile on reload, keeping stored session:", errMsg);
            }
          }
        }
      } catch (err: unknown) {
        console.error("Failed to initialize auth state:", err);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }
    };

    initializeAuth();
  }, []);

  const saveAuth = (authData: AuthResponseData) => {
    setToken(authData.accessToken);
    setUser(authData.user);
    localStorage.setItem("accessToken", authData.accessToken);
    syncAuthCookie(authData.accessToken);
    if (authData.user) {
      localStorage.setItem("user", JSON.stringify(authData.user));
    } else {
      localStorage.removeItem("user");
    }
    setIsHydrated(true);
  };

  const logout = async () => {
    if (token) {
      await logoutApi(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    syncAuthCookie(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { user: freshUser } = await getMeApi(token);
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Failed to refresh user profile:", msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isHydrated,
        saveAuth,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
