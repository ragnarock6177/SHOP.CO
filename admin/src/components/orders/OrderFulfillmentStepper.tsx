"use client";

import React from "react";
import { Check } from "lucide-react";
import { OrderStatus } from "@/hooks/queries/useOrders";
import {
  ORDER_STATUS_FLOW,
  getOrderStatusLabel,
  getOrderStatusStepIndex,
} from "@/lib/orders/status";
import { cn } from "@/lib/utils";

interface OrderFulfillmentStepperProps {
  status: OrderStatus;
}

export function OrderFulfillmentStepper({ status }: OrderFulfillmentStepperProps) {
  const activeIndex = getOrderStatusStepIndex(status);
  const isTerminal =
    status === "CANCELLED" || status === "REFUNDED" || status === "FAILED";

  if (isTerminal) {
    return (
      <div className="rounded-xl border border-rose-200/80 bg-rose-50/60 px-5 py-4 text-xs font-semibold text-rose-700 shadow-xs">
        This order is {getOrderStatusLabel(status).toLowerCase()} and no longer in the fulfillment flow.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-5 shadow-xs">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Fulfillment Progress
      </p>
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        {ORDER_STATUS_FLOW.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex min-w-[5rem] flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                    isComplete && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20",
                    !isComplete && !isCurrent && "border-slate-200 bg-slate-50 text-slate-400",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-center text-[10px] font-bold uppercase tracking-wide",
                    isCurrent ? "text-slate-900" : isComplete ? "text-emerald-700" : "text-slate-400",
                  )}
                >
                  {getOrderStatusLabel(step)}
                </span>
              </div>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={cn(
                    "mb-6 h-0.5 min-w-[1.25rem] flex-1 rounded-full",
                    index < activeIndex ? "bg-emerald-400" : "bg-slate-200",
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
