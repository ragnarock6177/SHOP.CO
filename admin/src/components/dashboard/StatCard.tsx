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
      className={`relative overflow-hidden rounded-md border p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md group ${
        isAlert
          ? "border-rose-200 bg-rose-50/40 text-slate-900 hover:border-rose-300"
          : "border-slate-200/80 bg-white text-slate-900 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-all duration-200 ${
            isAlert
              ? "bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
              : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white shadow-2xs"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="mt-1.5 text-xs text-slate-500 font-medium">{subtitle}</p>}
        {trend && (
          <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
