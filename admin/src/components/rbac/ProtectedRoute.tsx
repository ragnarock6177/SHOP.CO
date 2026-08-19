"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, isLoading, user, permissions } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect AFTER loading is complete and user is definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // While the auth session is being restored from localStorage, show a loading spinner
  // This prevents the flash redirect on reload when the user IS logged in
  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white text-neutral-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
          <p className="text-xs font-medium text-neutral-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // After loading, if still not authenticated, render nothing (redirect is in-flight)
  if (!isAuthenticated) {
    return null;
  }

  // Permission gate
  if (requiredPermission && !user?.isSuperAdmin) {
    const hasPerm = permissions.includes(requiredPermission);
    if (!hasPerm) {
      return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-white p-6 text-neutral-900">
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-lg">
            <h2 className="text-xl font-semibold text-red-500">403 — Access Forbidden</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Your staff account does not have the required permission (
              <code className="text-neutral-700">{requiredPermission}</code>) to view this page.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
