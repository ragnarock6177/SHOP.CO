"use client";

import React from "react";
import { Clock } from "lucide-react";
import { OrderDetail } from "@/hooks/queries/useOrders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatOrderDateTime, formatRelativeTime } from "@/lib/orders/format";
import { getOrderStatusLabel } from "@/lib/orders/status";

interface OrderActivityTimelineProps {
  history: OrderDetail["statusHistory"];
}

export function OrderActivityTimeline({ history }: OrderActivityTimelineProps) {
  if (!history?.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-xs text-slate-500">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((entry, index) => (
        <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
          {index < history.length - 1 && (
            <span className="absolute left-[9px] top-5 h-[calc(100%-8px)] w-px bg-linear-to-b from-slate-300 to-slate-100" />
          )}
          <span
            className={cn(
              "relative z-10 mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm",
              index === 0 ? "bg-slate-900 ring-4 ring-slate-100" : "bg-white ring-2 ring-slate-200",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                index === 0 ? "bg-white" : "bg-slate-400",
              )}
            />
          </span>
          <div className="min-w-0 flex-1 rounded-lg border border-slate-100 bg-slate-50/40 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={entry.newStatus} />
              {entry.oldStatus && (
                <span className="text-[11px] font-medium text-slate-500">
                  from {getOrderStatusLabel(entry.oldStatus)}
                </span>
              )}
            </div>
            {entry.reason && (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{entry.reason}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">
                {entry.changedByName || "System"}
              </span>
              <span className="text-slate-300">·</span>
              <span title={formatOrderDateTime(entry.createdAt)}>
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderSectionCard({
  title,
  icon,
  children,
  action,
  className,
  contentClassName,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-sm font-bold tracking-tight text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      <div className={cn("px-5 py-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function OrderTimelineSection({ history }: OrderActivityTimelineProps) {
  return (
    <OrderSectionCard
      title="Activity Timeline"
      icon={<Clock className="h-4 w-4 text-slate-500" />}
    >
      <OrderActivityTimeline history={history} />
    </OrderSectionCard>
  );
}
