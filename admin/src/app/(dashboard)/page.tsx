"use client";

import React, { useState } from "react";
import { IndianRupee, ShoppingBag, AlertTriangle, RotateCcw, Activity } from "lucide-react";
import { useDashboard } from "@/hooks/queries/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>("7d");
  const { data: metrics, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center text-xs text-red-300">
        Failed to load executive dashboard analytics. Please verify backend API connectivity.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Executive Dashboard</h1>
          <p className="text-xs text-zinc-400">AIRAVÉ Operational Metrics & System Stream</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Revenue"
          value={`₹${(metrics?.grossRevenue || 0).toLocaleString("en-IN")}`}
          subtitle="Excludes cancelled & refunded"
          icon={IndianRupee}
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
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100">Recent Orders</h2>
            <Link href="/orders" className="text-xs font-semibold text-zinc-400 hover:text-zinc-100">
              View All →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-zinc-800/60">
            {metrics?.recentOrders?.length ? (
              metrics.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <Link href={`/orders/${order.id}`} className="text-xs font-semibold text-zinc-200 hover:underline">
                      #{order.orderNumber}
                    </Link>
                    <p className="text-[11px] text-zinc-400">{order.customerName}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold text-zinc-100">₹{order.totalAmount}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-zinc-500">No recent orders recorded.</p>
            )}
          </div>
        </div>

        {/* Recent Audit Log Activity Widget */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">System Audit Feed</h2>
            </div>
            <Link href="/audit-logs" className="text-xs font-semibold text-zinc-400 hover:text-zinc-100">
              View Audit Logs →
            </Link>
          </div>
          <div className="mt-3 divide-y divide-zinc-800/60">
            {metrics?.recentAuditLogs?.length ? (
              metrics.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-200">{log.action}</span>
                    <p className="text-[11px] text-zinc-400">By {log.actorName}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-zinc-500">No recent audit log stream.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
