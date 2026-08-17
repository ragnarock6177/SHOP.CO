"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SanitizedUser, AuthResponseData, getMeApi, logoutApi } from "@/lib/authApi";

interface AuthContextType {
  user: SanitizedUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  saveAuth: (authData: AuthResponseData) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SanitizedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Validate and fetch fresh profile from backend
          try {
            const { user: freshUser } = await getMeApi(storedToken);
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
          } catch {
            // Token expired or invalid
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
      }
    };

    initializeAuth();
  }, []);

  const saveAuth = (authData: AuthResponseData) => {
    setToken(authData.accessToken);
    setUser(authData.user);
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("user", JSON.stringify(authData.user));

    // Call /me API once to fetch fresh profile details
    getMeApi(authData.accessToken)
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
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
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
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
