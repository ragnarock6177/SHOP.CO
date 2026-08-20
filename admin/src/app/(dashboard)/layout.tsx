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
      <div className="flex min-h-[100dvh] w-full bg-[#f8fafc] text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
        <Sidebar />
        <div className="flex flex-1 flex-col sm:pl-64">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
