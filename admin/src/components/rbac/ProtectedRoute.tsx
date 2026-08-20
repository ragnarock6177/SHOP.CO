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
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect AFTER mounted & loading is complete and user is definitely not authenticated
    if (mounted && !isLoading && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [mounted, isLoading, isAuthenticated, router, pathname]);

  // While mounting or loading session, render matching shell
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f8fafc] text-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900 shadow-xs" />
          <p className="text-xs font-semibold text-slate-500">Verifying session...</p>
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
        <div className="flex min-h-[100dvh] items-center justify-center bg-white p-6 text-slate-900">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-lg">
            <h2 className="text-xl font-semibold text-red-500">403 — Access Forbidden</h2>
            <p className="mt-2 text-sm text-slate-500">
              Your staff account does not have the required permission (
              <code className="text-slate-700">{requiredPermission}</code>) to view this page.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
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
