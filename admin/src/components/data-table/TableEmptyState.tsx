"use client";

import React from "react";
import { PackageOpen, SearchX, RefreshCw } from "lucide-react";

export interface TableEmptyStateProps {
  title?: string;
  description?: string;
  icon?: "package" | "search" | "refresh";
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

export function TableEmptyState({
  title = "No records found",
  description = "There are no entries matching your current view or filters.",
  icon = "package",
  onReset,
  resetLabel = "Clear Filters",
  className = "",
}: TableEmptyStateProps) {
  const IconComponent =
    icon === "search" ? SearchX : icon === "refresh" ? RefreshCw : PackageOpen;

  return (
    <div
      className={`flex flex-1 min-h-65 h-full w-full flex-col items-center justify-center p-8 text-center select-none ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-400 shadow-2xs mb-3.5 transition-transform duration-200 hover:scale-105">
        <IconComponent className="h-6 w-6 stroke-[1.5] text-slate-500" />
      </div>
      <h4 className="text-xs font-bold text-slate-900">{title}</h4>
      <p className="mt-1 max-w-sm text-[11px] text-slate-500 font-normal leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3 w-3 text-slate-400" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
}

export default TableEmptyState;
