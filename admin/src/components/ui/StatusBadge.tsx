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
        return "border-emerald-800/60 bg-emerald-950/40 text-emerald-300";
      case "PROCESSING":
      case "CONFIRMED":
      case "SHIPPED":
        return "border-zinc-700 bg-zinc-800 text-zinc-200";
      case "LOW_STOCK":
      case "PENDING":
      case "SUSPENDED":
      case "DRAFT":
        return "border-zinc-700 bg-zinc-900 text-zinc-400";
      case "OUT_OF_STOCK":
      case "CANCELLED":
      case "BLOCKED":
      case "ARCHIVED":
      case "FAILED":
      case "REJECTED":
        return "border-red-900/60 bg-red-950/40 text-red-300";
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "border-zinc-800 bg-zinc-900 text-zinc-300";
      default:
        return "border-zinc-800 bg-zinc-900 text-zinc-400";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${getStyle()} ${className}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
};

export default StatusBadge;
