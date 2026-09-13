import React from "react";
import { Loader2, ShieldCheck, Tag } from "lucide-react";
import { CheckoutOrderItem } from "@/components/shop/CheckoutOrderItem";
import type { CartItem } from "@/types/ecommerce";
import type { CheckoutSummaryData } from "@/lib/orderApi";

interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromo: (e: React.FormEvent) => void;
  summary: CheckoutSummaryData | null;
  summaryLoading: boolean;
  submitting: boolean;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function CheckoutOrderSummary({
  cart,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  summary,
  summaryLoading,
  submitting,
  subtotal,
  discountAmount,
  shippingAmount,
  taxAmount,
  totalAmount,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
        <h3 className="font-be-vietnam-pro-black text-lg sm:text-xl font-black text-black uppercase tracking-tight">
          Order Review ({cart.length})
        </h3>
      </div>

      {/* Items Preview List */}
      <div className="max-h-72 space-y-2.5 overflow-y-auto pr-1 scrollbar-none">
        {cart.map((item, idx) => (
          <CheckoutOrderItem
            key={`${item.product.id}-${item.selectedColor || ""}-${item.selectedSize || ""}-${idx}`}
            item={item}
          />
        ))}
      </div>

      {/* Promo Code Box */}
      <div className="space-y-1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Promo Code (e.g. SUMMER2026)"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              className="w-full bg-[#F4F4F4] rounded-full pl-9 pr-3 py-2.5 text-xs text-black placeholder-gray-400 focus:outline-none uppercase font-bold"
            />
          </div>
          <button
            type="button"
            onClick={onApplyPromo}
            disabled={summaryLoading}
            className="px-4 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-60 text-white rounded-full text-xs font-bold cursor-pointer transition-colors"
          >
            {summaryLoading ? "..." : "Apply"}
          </button>
        </div>

        {summary?.coupon && !summaryLoading && (
          <p
            className={`text-[11px] font-semibold pt-1 ${
              summary.coupon.applied ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {summary.coupon.message}
          </p>
        )}
      </div>

      {/* Server & Client Calculated Breakdown */}
      <div className="space-y-2.5 text-xs text-gray-500 font-medium border-t border-gray-100 pt-3.5">
        <div className="flex justify-between items-center">
          <span>Items Subtotal</span>
          {summaryLoading ? (
            <span className="inline-block w-16 h-3.5 bg-gray-200 animate-pulse rounded" />
          ) : (
            <span className="font-bold text-black">
              ₹{subtotal.toLocaleString()}
            </span>
          )}
        </div>

        {(discountAmount > 0 || summaryLoading) && (
          <div className="flex justify-between items-center text-emerald-700 font-bold">
            <span>Coupon Discount</span>
            {summaryLoading ? (
              <span className="inline-block w-14 h-3.5 bg-emerald-100 animate-pulse rounded" />
            ) : (
              <span>-₹{discountAmount.toLocaleString()}</span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span>Shipping Fee</span>
          {summaryLoading ? (
            <span className="inline-block w-12 h-3.5 bg-gray-200 animate-pulse rounded" />
          ) : (
            <span className="font-bold text-black">
              {shippingAmount === 0 ? (
                <span className="text-emerald-700 font-extrabold">FREE</span>
              ) : (
                `₹${shippingAmount.toLocaleString()}`
              )}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span>GST Tax (18%)</span>
          {summaryLoading ? (
            <span className="inline-block w-14 h-3.5 bg-gray-200 animate-pulse rounded" />
          ) : (
            <span className="font-bold text-black">
              ₹{taxAmount.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center text-base font-black text-black pt-2.5 border-t border-gray-100">
          <span>Grand Total</span>
          {summaryLoading ? (
            <span className="inline-block w-20 h-5 bg-gray-300 animate-pulse rounded" />
          ) : (
            <span>₹{totalAmount.toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Submit CTA */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-full bg-black hover:bg-neutral-800 disabled:opacity-50 text-white font-extrabold text-xs uppercase transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Placing Order...</span>
          </>
        ) : (
          <span>Place Order (₹{totalAmount.toLocaleString()})</span>
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium pt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Backend Verified 256-bit SSL Security</span>
      </div>
    </div>
  );
}
