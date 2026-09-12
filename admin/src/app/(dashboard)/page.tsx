"use client";

import React, { useState, useMemo } from "react";
import {
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
  RotateCcw,
  Activity,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useDashboard } from "@/hooks/queries/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { CustomSelect } from "@/components/ui/select";
import Link from "next/link";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>("7d");

  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }
    if (dateRange === "7d") {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }
    if (dateRange === "30d") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { fromDate: start.toISOString(), toDate: now.toISOString() };
    }
    return { fromDate: undefined, toDate: undefined };
  }, [dateRange]);

  const { data: metrics, isLoading, error } = useDashboard(fromDate, toDate);

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

  const maxTimelineRevenue = Math.max(
    ...(metrics?.salesVelocityTimeline?.map((t) => t.revenue) || [1]),
    1
  );

  const statusBreakdown = metrics?.statusBreakdown || {};
  const totalStatusCount =
    Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  const fulfillmentStages = [
    { label: "Pending", count: statusBreakdown.PENDING || 0, status: "PENDING" },
    { label: "Confirmed", count: statusBreakdown.CONFIRMED || 0, status: "CONFIRMED" },
    { label: "Processing", count: statusBreakdown.PROCESSING || 0, status: "PROCESSING" },
    { label: "Shipped", count: statusBreakdown.SHIPPED || 0, status: "SHIPPED" },
    { label: "Delivered", count: statusBreakdown.DELIVERED || 0, status: "DELIVERED" },
  ];

  const hasUrgentActions =
    (metrics?.overduePendingOrdersCount || 0) > 0 ||
    (metrics?.lowStockCount || 0) > 0 ||
    (metrics?.pendingReturns || 0) > 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Store Executive Overview</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time sales velocity, order fulfillment pipeline, and operational inventory health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
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

          <Link
            href="/orders"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Orders Board</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Actionable Urgent Operational Bar */}
      {hasUrgentActions && (
        <div className="rounded-md border border-slate-200 bg-slate-900 text-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Immediate Operational Tasks</p>
              <p className="text-[11px] text-slate-400">
                Action required on orders, low inventory stock levels, or pending customer returns.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(metrics?.overduePendingOrdersCount || 0) > 0 && (
              <Link
                href="/orders?status=PENDING"
                className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-500/30 transition-colors"
              >
                <AlertCircle className="h-3 w-3" />
                <span>{metrics?.overduePendingOrdersCount} Overdue Orders</span>
              </Link>
            )}

            {(metrics?.lowStockCount || 0) > 0 && (
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>{metrics?.lowStockCount} Low Stock SKUs</span>
              </Link>
            )}

            {(metrics?.pendingReturns || 0) > 0 && (
              <Link
                href="/returns"
                className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>{metrics?.pendingReturns} Returns Pending</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 4 Executive KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gross Revenue"
          value={`₹${Math.round(metrics?.grossRevenue || 0).toLocaleString("en-IN")}`}
          subtitle={`Net: ₹${Math.round(metrics?.netRevenue || 0).toLocaleString("en-IN")}`}
          icon={IndianRupee}
          trend={metrics?.revenueTrend}
        />
        <StatCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          subtitle={`Today: ${metrics?.todayOrders || 0} orders`}
          icon={ShoppingBag}
          trend={metrics?.ordersTrend}
        />
        <StatCard
          title="Unfulfilled Orders"
          value={metrics?.unfulfilledOrders || 0}
          subtitle={`Pending: ${statusBreakdown.PENDING || 0} | Proc: ${statusBreakdown.PROCESSING || 0}`}
          icon={Package}
          isAlert={(metrics?.unfulfilledOrders || 0) > 0}
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics?.lowStockCount || 0}
          subtitle={`Out of stock: ${metrics?.outOfStockCount || 0}`}
          icon={AlertTriangle}
          isAlert={(metrics?.lowStockCount || 0) > 0}
        />
      </div>

      {/* Sales Velocity Timeline & Fulfillment Funnel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Velocity Timeline Chart Widget */}
        <div className="lg:col-span-2 rounded-md border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Sales Velocity Timeline</h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Daily revenue generation & order transaction volume across the window.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-900">
                Peak: ₹{maxTimelineRevenue.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Visual Histogram Track */}
            <div className="mt-6">
              {metrics?.salesVelocityTimeline?.length ? (
                <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2 border-b border-slate-100">
                  {metrics.salesVelocityTimeline.map((item, idx) => {
                    const heightPercent = Math.max(
                      Math.round((item.revenue / maxTimelineRevenue) * 100),
                      6
                    );
                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap z-20 pointer-events-none shadow-md">
                          <span>₹{item.revenue.toLocaleString("en-IN")}</span>
                          <span className="text-slate-400 text-[9px]">{item.orders} orders</span>
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] rounded-t-sm bg-slate-900 group-hover:bg-slate-700 transition-all duration-150"
                        />
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400 font-medium">
                  No sales velocity records in this time period.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Excludes cancelled and refunded transactions</span>
            <Link href="/orders" className="text-slate-900 font-bold hover:underline flex items-center gap-1">
              <span>View detailed ledger</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Order Fulfillment Pipeline Funnel */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Fulfillment Pipeline</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {metrics?.totalOrders || 0} Total
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {fulfillmentStages.map((stage) => {
                const pct = Math.round((stage.count / totalStatusCount) * 100);
                return (
                  <div key={stage.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={stage.status} />
                        <span className="text-slate-600 font-medium">{stage.label}</span>
                      </div>
                      <span className="text-slate-900">
                        {stage.count} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">After-Sales Queue:</span>
            <div className="flex items-center gap-3 font-bold text-slate-900">
              <span>Returns: {metrics?.pendingReturns || 0}</span>
              <span>•</span>
              <span>Refunds: {metrics?.pendingRefunds || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Products & Payment Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products Widget */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Package className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Top Performing Products</h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
            >
              <span>Catalog</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="mt-2 divide-y divide-slate-100">
            {metrics?.topSellingProducts?.length ? (
              metrics.topSellingProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 hover:bg-slate-50/60 px-2 rounded-md transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-700">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-500">SKU: {prod.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900">₹{prod.revenue.toLocaleString("en-IN")}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{prod.unitsSold} units</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">
                No product sales recorded in this period.
              </p>
            )}
          </div>
        </div>

        {/* Payment Gateway Distribution Widget */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Payment Breakdown</h2>
            </div>
            <Link
              href="/payments"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
            >
              <span>Transactions</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="mt-3 space-y-4">
            {metrics?.paymentDistribution?.length ? (
              metrics.paymentDistribution.map((pay, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 uppercase tracking-wider">{pay.provider}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900">₹{pay.amount.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({pay.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-300"
                      style={{ width: `${pay.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{pay.count} processed orders</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-slate-400 font-medium">
                No payment gateway records in this period.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & System Audit Log Streams */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders Widget */}
        <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Recent Customer Orders</h2>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
            >
              <span>View All</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {metrics?.recentOrders?.length ? (
              metrics.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-bold text-slate-700">
                      {order.customerName ? order.customerName[0].toUpperCase() : "#"}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/orders/${order.id}`} className="text-xs font-bold text-slate-900 hover:underline block truncate">
                        #{order.orderNumber}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {order.paymentProvider || "COD"}
                      </span>
                    </div>
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
            <Link
              href="/audit-logs"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 group"
            >
              <span>View Logs</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
          <div className="mt-2 divide-y divide-slate-100">
            {metrics?.recentAuditLogs?.length ? (
              metrics.recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3.5 hover:bg-slate-50/60 px-2 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-slate-400" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">{log.action}</span>
                      <p className="text-[11px] text-slate-500 truncate">
                        By {log.actorName} • {log.entityType}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
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
