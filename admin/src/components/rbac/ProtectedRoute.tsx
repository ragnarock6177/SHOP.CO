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
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100" />
          <p className="text-xs font-medium text-zinc-400">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredPermission && !user?.isSuperAdmin) {
    const hasPerm = permissions.includes(requiredPermission);
    if (!hasPerm) {
      return (
        <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 p-6 text-zinc-100">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center shadow-xl">
            <h2 className="text-xl font-semibold text-red-400">403 - Access Forbidden</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Your staff account does not possess the required permission (<code className="text-zinc-200">{requiredPermission}</code>) to view this page.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
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
