"use client";

import React from "react";

export type StatusVariant =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "ACTIVE"
  | "SUSPENDED"
  | "BLOCKED"
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "PUBLISHED"
  | "DRAFT"
  | "ARCHIVED"
  | string;

export interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalized = (status || "").toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case "DELIVERED":
      case "ACTIVE":
      case "IN_STOCK":
      case "PUBLISHED":
      case "COMPLETED":
        return "border-emerald-200/80 bg-emerald-50 text-emerald-700 dot-emerald";
      case "PROCESSING":
      case "CONFIRMED":
      case "SHIPPED":
        return "border-blue-200/80 bg-blue-50 text-blue-700 dot-blue";
      case "LOW_STOCK":
      case "PENDING":
      case "SUSPENDED":
      case "DRAFT":
        return "border-amber-200/80 bg-amber-50 text-amber-700 dot-amber";
      case "OUT_OF_STOCK":
      case "CANCELLED":
      case "BLOCKED":
      case "ARCHIVED":
      case "FAILED":
      case "REJECTED":
        return "border-rose-200/80 bg-rose-50 text-rose-700 dot-rose";
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "border-purple-200/80 bg-purple-50 text-purple-700 dot-purple";
      default:
        return "border-slate-200 bg-slate-100 text-slate-700 dot-slate";
    }
  };

  const getDotColor = () => {
    switch (normalized) {
      case "DELIVERED":
      case "ACTIVE":
      case "IN_STOCK":
      case "PUBLISHED":
      case "COMPLETED":
        return "bg-emerald-500";
      case "PROCESSING":
      case "CONFIRMED":
      case "SHIPPED":
        return "bg-blue-500";
      case "LOW_STOCK":
      case "PENDING":
      case "SUSPENDED":
      case "DRAFT":
        return "bg-amber-500";
      case "OUT_OF_STOCK":
      case "CANCELLED":
      case "BLOCKED":
      case "ARCHIVED":
      case "FAILED":
      case "REJECTED":
        return "bg-rose-500";
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "bg-purple-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getStyle()} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${getDotColor()}`} />
      {normalized.replace(/_/g, " ")}
    </span>
  );
};

export default StatusBadge;
