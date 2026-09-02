"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link.js";
import { ArrowLeft, Clock, PackageCheck, User, MapPin } from "lucide-react";
import { useOrderDetails, useUpdateOrderStatus, OrderStatus } from "../../../../hooks/queries/useOrders";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { OrderCancelModal } from "../../../../components/orders/OrderCancelModal";
import { PermissionGate } from "../../../../components/rbac/PermissionGate";
import { CustomSelect } from "@/components/ui/select";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: order, isLoading, error } = useOrderDetails(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-md animate-shimmer bg-slate-100 border border-slate-200/60" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 rounded-md animate-shimmer bg-slate-100" />
              <div className="h-3 w-36 rounded-md animate-shimmer bg-slate-100" />
            </div>
          </div>
          <div className="h-6 w-24 rounded-md animate-shimmer bg-slate-100" />
        </div>

        {/* 3 Column Grid Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="h-4 w-4 rounded animate-shimmer bg-slate-100" />
                <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100" />
              </div>
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-4 w-40 rounded-md animate-shimmer bg-slate-100" />
                      <div className="h-3 w-20 rounded-md animate-shimmer bg-slate-100" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <div className="h-3.5 w-16 rounded-md animate-shimmer bg-slate-100 ml-auto" />
                      <div className="h-4 w-12 rounded-md animate-shimmer bg-slate-100 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100 border-b border-slate-100 pb-3" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-28 rounded-md animate-shimmer bg-slate-100" />
                <div className="h-3 w-40 rounded-md animate-shimmer bg-slate-100" />
              </div>
            </div>
            <div className="rounded-md border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
              <div className="h-4 w-32 rounded-md animate-shimmer bg-slate-100 border-b border-slate-100 pb-3" />
              <div className="space-y-2 pt-1">
                <div className="h-3.5 w-full rounded-md animate-shimmer bg-slate-100" />
                <div className="h-3.5 w-3/4 rounded-md animate-shimmer bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50/60 p-6 text-center text-xs font-semibold text-rose-700 shadow-xs">
        Order not found or error loading order details.
      </div>
    );
  }

  // Allowed state transitions based on backend state machine
  const getAllowedTransitions = (current: OrderStatus): OrderStatus[] => {
    switch (current) {
      case "PENDING":
        return ["CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["PROCESSING", "CANCELLED"];
      case "PROCESSING":
        return ["SHIPPED", "CANCELLED"];
      case "SHIPPED":
        return ["DELIVERED"];
      case "DELIVERED":
      case "CANCELLED":
      case "REFUNDED":
      default:
        return [];
    }
  };

  const allowedTransitions = getAllowedTransitions(order.status);

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
      {
        onSuccess: () => setIsCancelModalOpen(false),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push("/orders")}
            className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <p className="text-xs text-slate-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={order.status} />

          <PermissionGate permission="orders:update_status">
            {allowedTransitions.length > 0 && (
              <CustomSelect
                value=""
                placeholder="Advance Order Status..."
                onChange={(val) => {
                  if (val) handleStatusChange(val as OrderStatus);
                }}
                disabled={updateStatusMutation.isPending}
                options={allowedTransitions.map((st) => ({
                  value: st,
                  label: `Mark as ${st}`,
                }))}
                triggerClassName="w-48"
              />
            )}
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Line Items Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Table */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <PackageCheck className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Order Line Items</h2>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-semibold text-slate-800">{item.productName}</span>
                    <p className="text-[10px] text-slate-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-700">
                      ₹{item.unitPrice} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900">₹{item.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Status History Audit Trail</h2>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {order.statusHistory?.length ? (
                order.statusHistory.map((hist) => (
                  <div key={hist.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={hist.newStatus} />
                        {hist.reason && <span className="text-[11px] text-slate-500">({hist.reason})</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Changed by: {hist.changedBy || "System"}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(hist.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-500">No status transitions recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary Section */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-900">Customer Details</h2>
            </div>
            <div className="text-xs space-y-1 text-slate-700">
              <p className="font-semibold text-slate-900">{order.customerName}</p>
              <p className="text-slate-500">{order.customerEmail}</p>
            </div>
          </div>

          {/* Shipping Address Card */}
          {order.shippingAddress && (
            <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <MapPin className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Shipping Address</h2>
              </div>
              <div className="text-xs space-y-1 text-slate-700">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p className="text-slate-500">{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Financial Breakdown Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">Financial Summary</h2>
            <div className="text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discount</span>
                <span>-₹{order.discountAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>₹{order.shippingAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Amount</span>
                <span>₹{order.taxAmount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
