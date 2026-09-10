"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  PackageCheck,
} from "lucide-react";
import {
  useOrderDetails,
  useUpdateOrderStatus,
  OrderStatus,
} from "../../../../hooks/queries/useOrders";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { OrderCancelModal } from "../../../../components/orders/OrderCancelModal";
import { PermissionGate } from "../../../../components/rbac/PermissionGate";
import { OrderStatusSelect } from "@/components/orders/OrderStatusSelect";
import { OrderFulfillmentStepper } from "@/components/orders/OrderFulfillmentStepper";
import { OrderLineItemsTable } from "@/components/orders/OrderLineItemsTable";
import { OrderTimelineSection, OrderSectionCard } from "@/components/orders/OrderActivityTimeline";
import {
  OrderDetailSidebar,
  OrderSummaryCard,
} from "@/components/orders/OrderDetailSidebar";
import { formatOrderDateTime } from "@/lib/orders/format";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const { data: order, isLoading, error } = useOrderDetails(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const handleStatusChange = (nextStatus: OrderStatus) => {
    if (nextStatus === "CANCELLED") {
      setIsCancelModalOpen(true);
      return;
    }
    updateStatusMutation.mutate({ id: orderId, status: nextStatus });
  };

  const handleConfirmCancel = (reason: string) => {
    updateStatusMutation.mutate(
      { id: orderId, status: "CANCELLED", reason },
      { onSuccess: () => setIsCancelModalOpen(false) },
    );
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-fade-in-up">
        <div className="h-9 w-36 rounded-md animate-shimmer border border-slate-200/60 bg-slate-100" />

        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-52 rounded-md animate-shimmer bg-slate-100" />
              <div className="h-6 w-24 rounded-full animate-shimmer bg-slate-100" />
            </div>
            <div className="h-3.5 w-44 rounded-md animate-shimmer bg-slate-100" />
          </div>
          <div className="h-9 w-full rounded-md animate-shimmer border border-slate-200/60 bg-slate-100 md:w-64" />
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="mb-4 h-3 w-36 rounded-md animate-shimmer bg-slate-100" />
          <div className="flex items-center justify-between gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <React.Fragment key={i}>
                <div className="flex min-w-[5rem] flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full animate-shimmer bg-slate-100" />
                  <div className="h-2.5 w-14 rounded-md animate-shimmer bg-slate-100" />
                </div>
                {i < 4 && <div className="mb-6 h-0.5 min-w-[1.25rem] flex-1 rounded-full animate-shimmer bg-slate-100" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="h-4 w-28 rounded-md animate-shimmer bg-slate-100" />
              </div>
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3.5">
                    <div className="h-12 w-12 shrink-0 rounded-lg animate-shimmer bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-40 rounded-md animate-shimmer bg-slate-100" />
                      <div className="h-2.5 w-24 rounded-md animate-shimmer bg-slate-100" />
                    </div>
                    <div className="h-3.5 w-16 rounded-md animate-shimmer bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <div className="mb-5 h-4 w-36 rounded-md animate-shimmer bg-slate-100" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full animate-shimmer bg-slate-100" />
                    <div className="flex-1 space-y-2 rounded-lg border border-slate-100 bg-slate-50/40 p-4">
                      <div className="h-5 w-28 rounded-full animate-shimmer bg-slate-100" />
                      <div className="h-3 w-32 rounded-md animate-shimmer bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <div className="h-3 w-20 rounded-md animate-shimmer bg-slate-100" />
                  <div className="h-3 w-16 rounded-md animate-shimmer bg-slate-100" />
                </div>
              ))}
              <div className="h-14 w-full rounded-lg animate-shimmer bg-slate-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="h-4 w-28 rounded-md animate-shimmer bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-md animate-shimmer bg-slate-100" />
                <div className="h-3.5 w-3/4 rounded-md animate-shimmer bg-slate-100" />
                <div className="h-3.5 w-1/2 rounded-md animate-shimmer bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-xs">
        <p className="text-sm font-semibold text-rose-700">
          Order not found or failed to load order details.
        </p>
        <Link
          href="/orders"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="space-y-3 border-b border-slate-200/80 pb-5">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>

          <p className="text-xs text-slate-500">
            Placed {formatOrderDateTime(order.placedAt || order.createdAt)}
            {order.itemCount ? ` · ${order.itemCount} item${order.itemCount > 1 ? "s" : ""}` : ""}
          </p>
        </div>

        <PermissionGate permission="orders:update_status">
          <OrderStatusSelect
            currentStatus={order.status}
            disabled={updateStatusMutation.isPending}
            isLoading={updateStatusMutation.isPending}
            onStatusChange={handleStatusChange}
          />
        </PermissionGate>
      </div>

      <OrderFulfillmentStepper status={order.status} />

      {/* Main content — product detail style 8/4 split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <OrderSectionCard
            title="Line Items"
            icon={<PackageCheck className="h-4 w-4 text-slate-500" />}
            contentClassName="p-0 sm:p-0"
          >
            <OrderLineItemsTable items={order.items} />
          </OrderSectionCard>

          <OrderTimelineSection history={order.statusHistory} />
        </div>

        <div className="lg:col-span-4">
          <OrderSummaryCard order={order} className="lg:sticky lg:top-6" />
        </div>
      </div>

      {/* Meta cards bento */}
      <OrderDetailSidebar order={order} layout="grid" hideSummary />

      <OrderCancelModal
        isOpen={isCancelModalOpen}
        orderNumber={order.orderNumber}
        isLoading={updateStatusMutation.isPending}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
}
