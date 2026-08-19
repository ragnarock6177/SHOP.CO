"use client";

import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There are no entries matching your filter criteria.",
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
      <div className="rounded-full bg-zinc-900 p-3 text-zinc-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-zinc-200">{title}</h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
