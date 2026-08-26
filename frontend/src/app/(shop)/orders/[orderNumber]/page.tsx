"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowLeft,
  Download,
  AlertCircle,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getOrderByNumberApi, OrderDetailData } from "@/lib/orderApi";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber = (params?.orderNumber as string) || "";

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    setError(null);

    getOrderByNumberApi(orderNumber)
      .then((data) => {
        setOrder(data);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load order details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 text-black font-be-vietnam-pro">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Loading Order Details...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 text-black font-be-vietnam-pro">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-be-vietnam-pro-black text-2xl font-black uppercase text-black">
            Order Not Found
          </h1>
          <p className="text-xs text-gray-600 font-medium">
            {error || "We couldn't retrieve the requested order information."}
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-7 py-3 bg-black text-white font-extrabold text-xs uppercase rounded-full shadow-md"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  const shippingAddress = order.addresses?.find((a) => a.type === "SHIPPING");
  const formattedDate = order.placedAt || order.createdAt
    ? new Date(order.placedAt || order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Placed";

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-neutral-100 text-black border-neutral-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 text-black font-be-vietnam-pro space-y-6 sm:space-y-8 gpu-layer">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase text-gray-400">
            Order Status:
          </span>
          <span
            className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${getStatusBadge(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Hero Confirmation Banner */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="flex-1 space-y-1">
            <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black uppercase text-black tracking-tight">
              ORDER CONFIRMED!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Thank you for your purchase. We've sent details to{" "}
              <strong className="text-black">{order.customerEmail}</strong>.
            </p>
          </div>
        </div>

        {/* Order Reference Key Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F9F9F9] p-4 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
              Order Reference
            </span>
            <span className="font-mono font-black text-black sm:text-sm">
              {order.orderNumber}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
              Date Placed
            </span>
            <span className="font-bold text-black">{formattedDate}</span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
              Payment Method
            </span>
            <span className="font-bold text-black uppercase">
              {order.payments?.[0]?.provider || "COD"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 block">
              Total Paid
            </span>
            <span className="font-black text-black text-sm">
              ₹{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Ordered Item Cards */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Items Ordered ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex gap-3.5 items-center p-3 rounded-2xl bg-white border border-gray-100 shadow-2xs"
              >
                <div className="w-14 h-16 aspect-3/4 bg-[#F0EEED] rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-black truncate uppercase">
                    {item.productName}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {item.variantName || "Standard Size"} &bull; Qty: {item.quantity}
                  </p>
                  <span className="text-[11px] font-semibold text-gray-400">
                    ₹{Number(item.unitPrice).toLocaleString()} per unit
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-black block">
                    ₹{Number(item.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          {/* Shipping Address Box */}
          <div className="bg-[#F9F9F9] p-4 rounded-2xl space-y-2 border border-gray-100">
            <div className="flex items-center gap-1.5 font-black uppercase text-black text-[11px]">
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Destination</span>
            </div>
            {shippingAddress ? (
              <div className="text-gray-600 space-y-0.5 font-medium leading-relaxed">
                <p className="font-bold text-black">
                  {shippingAddress.firstName} {shippingAddress.lastName || ""}
                </p>
                <p>{shippingAddress.addressLine1}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                </p>
                {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
              </div>
            ) : (
              <p className="text-gray-500 font-medium">
                Standard Shipping Destination
              </p>
            )}
          </div>

          {/* Breakdown Box */}
          <div className="space-y-2 text-gray-600 font-medium bg-[#F9F9F9] p-4 rounded-2xl border border-gray-100">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-bold text-black">
                ₹{Number(order.subtotal).toLocaleString()}
              </span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Discount:</span>
                <span>-₹{Number(order.discountAmount).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="font-bold text-black">
                {Number(order.shippingAmount) === 0 ? (
                  <span className="text-emerald-700 font-extrabold">FREE</span>
                ) : (
                  `₹${Number(order.shippingAmount).toLocaleString()}`
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span>GST Tax (18%):</span>
              <span className="font-bold text-black">
                ₹{Number(order.taxAmount).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span>₹{Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Order Record</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => alert(`Invoice downloaded for order ${order.orderNumber}`)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Invoice</span>
            </button>

            <Link
              href="/profile"
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-extrabold text-xs uppercase rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>View All Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
