"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/select";

export interface CouponFormModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [code, setCode] = useState<string>("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderSubtotal, setMinOrderSubtotal] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderSubtotal: minOrderSubtotal || 0,
      usageLimit: usageLimit === "" ? undefined : Number(usageLimit),
      startDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-semibold text-slate-900">Create Promotional Coupon</h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-slate-900 uppercase focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Discount Type</label>
              <CustomSelect
                value={discountType}
                onChange={(val) => setDiscountType(val as any)}
                options={[
                  { value: "PERCENTAGE", label: "Percentage (%)" },
                  { value: "FIXED_AMOUNT", label: "Fixed Amount (₹)" },
                ]}
                className="w-full"
                triggerClassName="w-full h-10 px-3.5"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Min Subtotal (₹)</label>
              <input
                type="number"
                value={minOrderSubtotal}
                onChange={(e) => setMinOrderSubtotal(Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Usage Limit</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                placeholder="Unlimited"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !code}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Save Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponFormModal;
