"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { SanitizedUser, AuthResponseData, logoutApi } from "@/lib/authApi";
import { getUserProfileApi, mapProfileToAuthUser } from "@/lib/userApi";
import {
  clearAuthSession,
  isAuthSessionExpired,
  markAuthSessionIssuedNow,
  persistAuthSession,
  readAuthSessionIssuedAt,
  readAuthTokenFromStorage,
  syncAuthCookie,
  AuthSessionError,
} from "@/lib/authSession";

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

function shouldForceLogout(error: unknown): boolean {
  if (!(error instanceof AuthSessionError)) return false;
  return error.status === 401 || error.status === 403;
}

function readStoredUser(): SanitizedUser | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser || storedUser === "undefined" || storedUser === "null") {
    return null;
  }

  try {
    return JSON.parse(storedUser) as SanitizedUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SanitizedUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitializedRef = useRef(false);

  const forceLogout = async (storedToken?: string | null) => {
    if (storedToken) {
      try {
        await logoutApi(storedToken);
      } catch {
        // Ignore network errors during forced logout cleanup.
      }
    }

    clearAuthSession();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeAuth = async () => {
      let storedToken: string | null = null;

      try {
        storedToken = readAuthTokenFromStorage();

        if (storedToken) {
          if (isAuthSessionExpired()) {
            await forceLogout(storedToken);
            return;
          }

          syncAuthCookie(storedToken);
          setToken(storedToken);

          const storedUser = readStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }

          if (readAuthSessionIssuedAt() === null) {
            markAuthSessionIssuedNow();
          }
        }
      } catch (err: unknown) {
        console.error("Failed to initialize auth state:", err);
      } finally {
        setIsLoading(false);
        setIsHydrated(true);
      }

      if (!storedToken || isAuthSessionExpired()) return;

      try {
        const profile = await getUserProfileApi(storedToken);
        const freshUser = mapProfileToAuthUser(profile);
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      } catch (error) {
        if (shouldForceLogout(error)) {
          await forceLogout(storedToken);
          return;
        }

        console.warn("Failed to refresh profile during auth init:", error);
      }
    };

    initializeAuth();
  }, []);

  const saveAuth = (authData: AuthResponseData) => {
    setToken(authData.accessToken);
    setUser(authData.user);
    persistAuthSession(authData.accessToken);
    if (authData.user) {
      localStorage.setItem("user", JSON.stringify(authData.user));
    } else {
      localStorage.removeItem("user");
    }
    setIsHydrated(true);

    getUserProfileApi(authData.accessToken)
      .then((profile) => {
        const freshUser = mapProfileToAuthUser(profile);
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      })
      .catch((err) => {
        if (shouldForceLogout(err)) {
          void forceLogout(authData.accessToken);
          return;
        }
        console.warn("Failed to fetch fresh user profile on login:", err);
      });
  };

  const logout = async () => {
    const activeToken = token || readAuthTokenFromStorage();
    await forceLogout(activeToken);
  };

  const refreshUser = async () => {
    const activeToken = token || readAuthTokenFromStorage();
    if (!activeToken) return;

    if (isAuthSessionExpired()) {
      await forceLogout(activeToken);
      return;
    }

    try {
      const profile = await getUserProfileApi(activeToken);
      const freshUser = mapProfileToAuthUser(profile);
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
    } catch (err) {
      if (shouldForceLogout(err)) {
        await forceLogout(activeToken);
        return;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token && !isAuthSessionExpired(),
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
