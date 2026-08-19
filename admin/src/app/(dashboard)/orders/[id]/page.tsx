"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link.js";
import { ArrowLeft, Clock, PackageCheck, User, MapPin } from "lucide-react";
import { useOrderDetails, useUpdateOrderStatus, OrderStatus } from "../../../../hooks/queries/useOrders";
import { StatusBadge } from "../../../../components/ui/StatusBadge";
import { OrderCancelModal } from "../../../../components/orders/OrderCancelModal";
import { PermissionGate } from "../../../../components/rbac/PermissionGate";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { data: order, isLoading, error } = useOrderDetails(orderId);
  const updateStatusMutation = useUpdateOrderStatus();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="h-96 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-6 text-center text-xs text-red-300">
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
            className="rounded-lg border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Order #{order.orderNumber}</h1>
            <p className="text-xs text-zinc-400">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={order.status} />

          <PermissionGate permission="orders:update_status">
            {allowedTransitions.length > 0 && (
              <select
                onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                defaultValue=""
                disabled={updateStatusMutation.isPending}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  Advance Order Status...
                </option>
                {allowedTransitions.map((st) => (
                  <option key={st} value={st}>
                    Mark as {st}
                  </option>
                ))}
              </select>
            )}
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Line Items Section */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items Table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <PackageCheck className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Order Line Items</h2>
            </div>
            <div className="divide-y divide-zinc-800/60 text-xs">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="font-semibold text-zinc-200">{item.productName}</span>
                    <p className="text-[10px] text-zinc-500 font-mono">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-300">
                      ₹{item.unitPrice} × {item.quantity}
                    </span>
                    <span className="font-bold text-zinc-100">₹{item.totalAmount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Clock className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Status History Audit Trail</h2>
            </div>
            <div className="divide-y divide-zinc-800/60 text-xs">
              {order.statusHistory?.length ? (
                order.statusHistory.map((hist) => (
                  <div key={hist.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={hist.newStatus} />
                        {hist.reason && <span className="text-[11px] text-zinc-400">({hist.reason})</span>}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Changed by: {hist.changedBy || "System"}</p>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(hist.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-zinc-500">No status transitions recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary Section */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <User className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-100">Customer Details</h2>
            </div>
            <div className="text-xs space-y-1 text-zinc-300">
              <p className="font-semibold text-zinc-100">{order.customerName}</p>
              <p className="text-zinc-400">{order.customerEmail}</p>
            </div>
          </div>

          {/* Shipping Address Card */}
          {order.shippingAddress && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-100">Shipping Address</h2>
              </div>
              <div className="text-xs space-y-1 text-zinc-300">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                <p className="text-zinc-500">{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Financial Breakdown Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-3">Financial Summary</h2>
            <div className="text-xs space-y-2 text-zinc-300">
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
              <div className="flex justify-between border-t border-zinc-800 pt-2 text-sm font-bold text-zinc-100">
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
