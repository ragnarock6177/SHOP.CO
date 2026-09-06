"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { buildLoginUrl, isProtectedPath } from "@/lib/routeGuard";
import { persistReturnUrl } from "@/lib/postLoginRedirect";
import { syncAuthCookie, readAuthTokenFromStorage } from "@/lib/authSession";

export function ShopAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading } = useAuth();
  const protectedRoute = isProtectedPath(pathname);

  useEffect(() => {
    const storedToken = readAuthTokenFromStorage();
    if (storedToken) {
      syncAuthCookie(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!protectedRoute || !isHydrated || isLoading) return;

    if (!isAuthenticated) {
      persistReturnUrl(pathname);
      router.replace(buildLoginUrl(pathname));
    }
  }, [protectedRoute, isAuthenticated, isHydrated, isLoading, pathname, router]);

  if (protectedRoute && (!isHydrated || isLoading)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-be-vietnam-pro">
        <div className="text-center space-y-2">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-xs font-semibold text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (protectedRoute && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
