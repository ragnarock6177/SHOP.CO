"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SanitizedUser, AuthResponseData, getMeApi, logoutApi } from "@/lib/authApi";

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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
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
          } catch {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
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
    if (authData.user) {
      localStorage.setItem("user", JSON.stringify(authData.user));
    } else {
      localStorage.removeItem("user");
    }
    setIsHydrated(true);

    // Call /me API once to fetch fresh profile details
    getMeApi(authData.accessToken)
      .then(({ user: freshUser }) => {
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch fresh user profile on login:", err);
      });
  };

  const logout = async () => {
    if (token) {
      await logoutApi(token);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { user: freshUser } = await getMeApi(token);
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error("Failed to refresh user profile:", err);
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
