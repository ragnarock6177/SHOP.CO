import React from "react";
import { CreditCard, ShieldCheck, Truck } from "lucide-react";

interface CheckoutPaymentMethodProps {
  paymentMethod: "razorpay" | "cod";
  onChange: (method: "razorpay" | "cod") => void;
}

export function CheckoutPaymentMethod({
  paymentMethod,
  onChange,
}: CheckoutPaymentMethodProps) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-be-vietnam-pro-black text-base sm:text-lg font-black text-black uppercase">
          3. Payment Method
        </h3>
        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-black" />
          256-Bit Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange("razorpay")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            paymentMethod === "razorpay"
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs block">Razorpay Secure</span>
              <CreditCard className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-[11px] opacity-80 block font-medium">
              UPI, Cards, NetBanking, EMI, Wallets
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-2 block">
            Instant Gateway Verification
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("cod")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
            paymentMethod === "cod"
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-xs block">Pay on Delivery (COD)</span>
              <Truck className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-[11px] opacity-80 block font-medium">
              Pay cash/UPI when package arrives
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-2 block">
            Available for all pin codes
          </span>
        </button>
      </div>
    </div>
  );
}
