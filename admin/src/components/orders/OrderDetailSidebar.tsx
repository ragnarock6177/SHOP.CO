"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  CreditCard,
  Truck,
  FileText,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { OrderDetail } from "@/hooks/queries/useOrders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderSectionCard } from "@/components/orders/OrderActivityTimeline";
import {
  formatAddressLines,
  formatINR,
  formatOrderDateTime,
  getCustomerInitials,
} from "@/lib/orders/format";
import { cn } from "@/lib/utils";

interface OrderDetailSidebarProps {
  order: OrderDetail;
  layout?: "stack" | "grid";
  hideSummary?: boolean;
}

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: OrderDetail["shippingAddress"];
}) {
  const lines = formatAddressLines(address);
  if (!lines.length) return null;

  return (
    <OrderSectionCard title={title} icon={<MapPin className="h-4 w-4 text-slate-500" />}>
      <div className="space-y-1.5 text-xs leading-relaxed text-slate-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </OrderSectionCard>
  );
}

export function OrderSummaryCard({
  order,
  className,
}: {
  order: OrderDetail;
  className?: string;
}) {
  return (
    <OrderSectionCard
      title="Order Summary"
      icon={<Receipt className="h-4 w-4 text-slate-500" />}
      className={className}
    >
      <div className="space-y-3 text-xs text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium text-slate-900">{formatINR(order.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-emerald-700">
          <span>Discount</span>
          <span className="font-medium">-{formatINR(order.discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Shipping</span>
          <span className="font-medium text-slate-900">{formatINR(order.shippingAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Tax (GST)</span>
          <span className="font-medium text-slate-900">{formatINR(order.taxAmount)}</span>
        </div>
        <div className="rounded-lg bg-slate-900 px-4 py-3.5 text-white">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
              Grand Total
            </span>
            <span className="text-lg font-bold tracking-tight">
              {formatINR(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </OrderSectionCard>
  );
}

export function OrderDetailSidebar({
  order,
  layout = "stack",
  hideSummary = false,
}: OrderDetailSidebarProps) {
  const initials = getCustomerInitials(order.customerName, order.customerEmail);

  const cards = (
    <>
      <OrderSectionCard title="Customer" icon={<User className="h-4 w-4 text-slate-500" />}>
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-slate-800 to-slate-950 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-xs">
            <p className="font-semibold text-slate-900">
              {order.customerName || "Guest Customer"}
            </p>
            {order.customerEmail && (
              <p className="truncate text-slate-600">{order.customerEmail}</p>
            )}
            {order.customerPhone && (
              <p className="text-slate-600">{order.customerPhone}</p>
            )}
            {order.userId && (
              <Link
                href={`/customers/${order.userId}`}
                className="inline-flex items-center gap-1 pt-1.5 text-[11px] font-semibold text-slate-900 hover:underline"
              >
                View customer profile
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </OrderSectionCard>

      <AddressBlock title="Shipping Address" address={order.shippingAddress} />
      <AddressBlock title="Billing Address" address={order.billingAddress} />

      {order.primaryPayment && (
        <OrderSectionCard
          title="Payment"
          icon={<CreditCard className="h-4 w-4 text-slate-500" />}
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={order.primaryPayment.status} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Method</span>
              <span className="font-semibold uppercase text-slate-900">
                {order.primaryPayment.provider}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Amount</span>
              <span className="font-semibold text-slate-900">
                {formatINR(order.primaryPayment.amount)}
              </span>
            </div>
            {order.primaryPayment.capturedAt && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Captured</span>
                <span className="text-slate-700">
                  {formatOrderDateTime(order.primaryPayment.capturedAt)}
                </span>
              </div>
            )}
          </div>
        </OrderSectionCard>
      )}

      {order.primaryShipment && (
        <OrderSectionCard
          title="Fulfillment"
          icon={<Truck className="h-4 w-4 text-slate-500" />}
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Shipment Status</span>
              <StatusBadge status={order.primaryShipment.status} />
            </div>
            {order.primaryShipment.carrier && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">Carrier</span>
                <span className="font-medium text-slate-900">{order.primaryShipment.carrier}</span>
              </div>
            )}
            {order.primaryShipment.trackingNumber && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Tracking Number
                </p>
                <p className="mt-1 font-mono text-xs font-bold text-slate-900">
                  {order.primaryShipment.trackingNumber}
                </p>
              </div>
            )}
          </div>
        </OrderSectionCard>
      )}

      {!hideSummary && <OrderSummaryCard order={order} />}

      {order.invoice && (
        <OrderSectionCard title="Invoice" icon={<FileText className="h-4 w-4 text-slate-500" />}>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Invoice #</span>
              <span className="font-mono font-semibold text-slate-900">
                {order.invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Status</span>
              <StatusBadge status={order.invoice.status} />
            </div>
          </div>
        </OrderSectionCard>
      )}

      {order.notes && (
        <OrderSectionCard title="Order Notes" icon={<FileText className="h-4 w-4 text-slate-500" />}>
          <p className="text-xs leading-relaxed text-slate-700">{order.notes}</p>
        </OrderSectionCard>
      )}
    </>
  );

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{cards}</div>
    );
  }

  return <div className={cn("space-y-4")}>{cards}</div>;
}
