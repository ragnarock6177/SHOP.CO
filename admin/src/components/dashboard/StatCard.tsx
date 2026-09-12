"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  isAlert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isAlert = false,
}) => {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-md border p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md group ${
        isAlert
          ? "border-rose-200 bg-rose-50/40 text-slate-900 hover:border-rose-300"
          : "border-slate-200/80 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-all duration-200 ${
            isAlert
              ? "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
              : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white shadow-2xs"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight truncate">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="mt-2.5 flex items-center">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border whitespace-nowrap ${
                trend.trim().startsWith("-")
                  ? "bg-rose-50 text-rose-700 border-rose-200/60"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
