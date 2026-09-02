"use client";

import React, { useState } from "react";
import { IndianRupee, ShoppingBag, AlertTriangle, RotateCcw, Activity } from "lucide-react";
import { useDashboard } from "@/hooks/queries/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { CustomSelect } from "@/components/ui/select";
import Link from "next/link";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>("7d");
  const { data: metrics, isLoading, error } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs">
        Failed to load executive dashboard analytics. Please verify backend API connectivity.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">

        <div className="flex items-center space-x-2">
          <CustomSelect
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            options={[
              { value: "today", label: "Today" },
              { value: "7d", label: "Last 7 Days" },
              { value: "30d", label: "Last 30 Days" },
              { value: "all", label: "All Time" },
            ]}
            triggerClassName="w-36"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Revenue"
          value={`₹${(metrics?.grossRevenue || 0).toLocaleString("en-IN")}`}
          subtitle="Excludes cancelled & refunded"
          icon={IndianRupee}
          trend="+12.4% vs last period"
        />
        <StatCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          subtitle={`Today: ${metrics?.todayOrders || 0} orders`}
          icon={ShoppingBag}
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics?.lowStockCount || 0}
          subtitle={`Out of stock: ${metrics?.outOfStockCount || 0}`}
          icon={AlertTriangle}
          isAlert={(metrics?.lowStockCount || 0) > 0}
        />
        <StatCard
          title="Pending After-Sales"
          value={(metrics?.pendingReturns || 0) + (metrics?.pendingRefunds || 0)}
          subtitle={`Returns: ${metrics?.pendingReturns || 0} | Refunds: ${metrics?.pendingRefunds || 0}`}
          icon={RotateCcw}
        />
      </div>

      {/* Widgets Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders Widget */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            </div>
            <Link href="/orders" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group">
              <span>View All</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {metrics?.recentOrders?.length ? (
              metrics.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 px-2 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-700">
                      {order.customerName ? order.customerName[0].toUpperCase() : "#"}
                    </div>
                    <div>
                      <Link href={`/orders/${order.id}`} className="text-xs font-bold text-slate-900 hover:underline">
                        #{order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-slate-500">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-900">₹{order.totalAmount}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">No recent orders recorded.</p>
            )}
          </div>
        </div>

        {/* Recent Audit Log Activity Widget */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">System Audit Feed</h2>
            </div>
            <Link href="/audit-logs" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group">
              <span>View Logs</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {metrics?.recentAuditLogs?.length ? (
              metrics.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 px-2 rounded-md transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900">{log.action}</span>
                      <p className="text-[11px] text-slate-500">By {log.actorName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">No recent audit log stream.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
