import React from "react";

interface CheckoutShippingSpeedProps {
  shippingSpeed: "STANDARD" | "EXPRESS";
  onChange: (speed: "STANDARD" | "EXPRESS") => void;
  subtotal: number;
}

export function CheckoutShippingSpeed({
  shippingSpeed,
  onChange,
  subtotal,
}: CheckoutShippingSpeedProps) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-4 sm:p-7 space-y-4 shadow-2xs">
      <h3 className="font-be-vietnam-pro-black text-base sm:text-lg font-black text-black uppercase border-b border-gray-100 pb-3">
        2. Shipping Option
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange("STANDARD")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            shippingSpeed === "STANDARD"
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
          }`}
        >
          <span className="font-bold text-xs block">Standard Delivery</span>
          <span className="text-[11px] opacity-80 block mt-0.5 font-medium">
            3-5 Business Days
          </span>
          <span className="font-black text-xs block mt-1.5">
            {subtotal >= 1999 ? "FREE" : "₹99"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange("EXPRESS")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            shippingSpeed === "EXPRESS"
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-[#F4F4F4] text-black hover:bg-gray-200"
          }`}
        >
          <span className="font-bold text-xs block">Express Priority</span>
          <span className="text-[11px] opacity-80 block mt-0.5 font-medium">
            1-2 Business Days
          </span>
          <span className="font-black text-xs block mt-1.5">
            {subtotal >= 1999 ? "₹150" : "₹249"}
          </span>
        </button>
      </div>
    </div>
  );
}
