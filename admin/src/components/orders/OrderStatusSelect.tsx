"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { OrderStatus } from "@/hooks/queries/useOrders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CustomSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getAllowedOrderTransitions,
  getOrderStatusActionLabel,
  getOrderStatusLabel,
  getPrimaryOrderTransition,
} from "@/lib/orders/status";

const SELECT_PLACEHOLDER = "__select_next_status__";

interface OrderStatusSelectProps {
  currentStatus: OrderStatus;
  disabled?: boolean;
  isLoading?: boolean;
  onStatusChange: (status: OrderStatus) => void;
  className?: string;
}

export function OrderStatusSelect({
  currentStatus,
  disabled,
  isLoading,
  onStatusChange,
  className,
}: OrderStatusSelectProps) {
  const [selectedAction, setSelectedAction] = useState(SELECT_PLACEHOLDER);
  const allowedTransitions = getAllowedOrderTransitions(currentStatus);
  const primaryTransition = getPrimaryOrderTransition(currentStatus);
  const secondaryTransitions = allowedTransitions.filter(
    (status) => status !== primaryTransition,
  );
  const hasUpdates = allowedTransitions.length > 0;

  useEffect(() => {
    setSelectedAction(SELECT_PLACEHOLDER);
  }, [currentStatus]);

  const handleSelectChange = (value: string) => {
    if (!value || value === SELECT_PLACEHOLDER) return;
    setSelectedAction(SELECT_PLACEHOLDER);
    onStatusChange(value as OrderStatus);
  };

  const selectOptions = [
    { value: SELECT_PLACEHOLDER, label: "More actions..." },
    ...secondaryTransitions.map((status) => ({
      value: status,
      label: getOrderStatusActionLabel(status) || `Mark as ${getOrderStatusLabel(status)}`,
    })),
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Update status
        </span>
        <span className="hidden h-3.5 w-px bg-slate-200 sm:inline" />
        <span className="shrink-0 text-[11px] font-medium text-slate-500">Now</span>
        <StatusBadge status={currentStatus} />
        {hasUpdates && primaryTransition && (
          <>
            <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-slate-300 sm:inline" />
            <span className="truncate text-[11px] font-medium text-slate-600">
              Next: {getOrderStatusLabel(primaryTransition)}
            </span>
          </>
        )}
      </div>

      {hasUpdates ? (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {primaryTransition && (
            <button
              type="button"
              disabled={disabled || isLoading}
              onClick={() => onStatusChange(primaryTransition)}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 text-[11px] font-bold text-white shadow-xs transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              {getOrderStatusActionLabel(primaryTransition)}
            </button>
          )}

          {secondaryTransitions.length > 0 && (
            <div className="relative min-w-[9.5rem] flex-1 sm:flex-none sm:w-[10.5rem]">
              <CustomSelect
                id="order-status-action"
                value={selectedAction}
                onChange={handleSelectChange}
                disabled={disabled || isLoading}
                options={selectOptions}
                placeholder="More actions..."
                triggerClassName="h-8 w-full text-[11px]"
              />
            </div>
          )}
        </div>
      ) : (
        <span className="text-[11px] font-semibold text-slate-500 sm:shrink-0">
          No updates available
        </span>
      )}
    </div>
  );
}
