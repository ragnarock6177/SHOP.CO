"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Package, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrdersApi, OrderDetailData } from "@/lib/orderApi";
import { formatINR } from "@/lib/formatPrice";
import {
  formatOrderStatusLabel,
  getOrderItemImage,
  getOrderStatusBadgeClass,
  isActiveOrderStatus,
  isCompletedOrderStatus,
  parseVariantParts,
} from "@/lib/orderUtils";

function OrderCard({ order }: { order: OrderDetailData }) {
  const placedDate = order.placedAt || order.createdAt;
  const formattedDate = placedDate
    ? new Date(placedDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const trackingNumber = order.shipments?.[0]?.trackingNumber;
  const isLive = isActiveOrderStatus(order.status);

  return (
    <article className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-2xs sm:p-6 space-y-3.5">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs">
        <div>
          <span className="block font-black text-black text-xs sm:text-sm">
            #{order.orderNumber}
          </span>
          <span className="text-[11px] font-medium text-gray-400">
            Placed on {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isLive && (
            <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-black uppercase text-white">
              Live
            </span>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${getOrderStatusBadgeClass(order.status)}`}
          >
            {formatOrderStatusLabel(order.status)}
          </span>
          <span className="font-black text-black text-xs sm:text-sm">
            {formatINR(Number(order.totalAmount))}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {order.items?.slice(0, 3).map((item, idx) => {
          const parts = parseVariantParts(item.variantName);
          return (
            <div key={item.id || idx} className="flex items-center gap-3">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-[#F0EEED]">
                <Image
                  src={getOrderItemImage(item)}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-black">{item.productName}</h4>
                <p className="text-[11px] font-medium text-gray-400">
                  {parts.size && <>Size: {parts.size} &bull; </>}
                  {parts.color && <>Color: {parts.color} &bull; </>}
                  Qty: {item.quantity}
                </p>
                <span className="text-xs font-black text-black">
                  {formatINR(Number(item.unitPrice))}
                </span>
              </div>
            </div>
          );
        })}
        {(order.items?.length || 0) > 3 && (
          <p className="text-[11px] font-semibold text-gray-400">
            +{(order.items?.length || 0) - 3} more item(s)
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-xs">
        {trackingNumber ? (
          <span className="text-[11px] font-medium text-gray-500">
            Tracking:{" "}
            <strong className="font-mono font-bold text-black">{trackingNumber}</strong>
          </span>
        ) : (
          <span className="text-[11px] font-medium text-gray-400">
            {isLive ? "Awaiting shipment update" : "No tracking available"}
          </span>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/orders/${encodeURIComponent(order.orderNumber)}`}
            className="cursor-pointer rounded-full bg-black px-3.5 py-1.5 text-[11px] font-bold uppercase text-white transition-colors hover:bg-neutral-800"
          >
            View Details
          </Link>
          {trackingNumber && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F4F4F4] px-3.5 py-1.5 text-[11px] font-bold text-black">
              <Truck className="h-3 w-3" />
              Track
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProfileOrdersPanel({
  onOrdersLoaded,
}: {
  onOrdersLoaded?: (count: number) => void;
}) {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderDetailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getUserOrdersApi(1, 50, token)
      .then((res) => {
        const list = res.data || [];
        setOrders(list);
        onOrdersLoaded?.(list.length);
      })
      .catch((err: Error) => setError(err.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, onOrdersLoaded]);

  const { activeOrders, completedOrders } = useMemo(() => {
    const active = orders.filter((order) => isActiveOrderStatus(order.status));
    const completed = orders.filter((order) => isCompletedOrderStatus(order.status));
    return { activeOrders: active, completedOrders: completed };
  }, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl bg-[#F4F4F4] p-8 text-center sm:p-12">
        <Package className="mx-auto h-9 w-9 text-gray-400" />
        <p className="mt-3 text-xs font-medium text-gray-600 sm:text-sm">
          Sign in to view your order history.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-xs font-semibold text-rose-700">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4 rounded-3xl bg-[#F4F4F4] p-8 text-center sm:p-12">
        <Package className="mx-auto h-9 w-9 text-gray-400" />
        <p className="text-xs font-medium text-gray-600 sm:text-sm">
          You haven&apos;t placed any orders yet.
        </p>
        <Link
          href="/product"
          className="inline-block rounded-full bg-black px-6 py-2.5 text-xs font-extrabold uppercase text-white"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeOrders.length > 0 && (
        <section className="space-y-3.5">
          <h3 className="font-be-vietnam-pro-black text-sm font-black uppercase tracking-wide text-black">
            Active Orders ({activeOrders.length})
          </h3>
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}

      {completedOrders.length > 0 && (
        <section className="space-y-3.5">
          <h3 className="font-be-vietnam-pro-black text-sm font-black uppercase tracking-wide text-black">
            Completed Orders ({completedOrders.length})
          </h3>
          {completedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}
    </div>
  );
}
