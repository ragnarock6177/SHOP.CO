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
      className={`relative overflow-hidden rounded-xl border p-5 shadow-lg transition ${
        isAlert
          ? "border-red-900/60 bg-red-950/20 text-red-200"
          : "border-zinc-800 bg-zinc-900 text-zinc-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{title}</span>
        <div className={`rounded-lg p-2 ${isAlert ? "bg-red-950 text-red-400" : "bg-zinc-800 text-zinc-300"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {subtitle && <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>}
        {trend && <span className="mt-2 inline-block text-[10px] font-semibold text-emerald-400">{trend}</span>}
      </div>
    </div>
  );
};

export default StatCard;
