import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import ProtectedRoute from "@/components/rbac/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-dvh w-full overflow-hidden bg-[#f8fafc] text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <Sidebar />
        <div className="flex flex-1 flex-col sm:pl-64 h-full min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
