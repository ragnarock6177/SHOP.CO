"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserAddress } from "@/types/address";
import { getAddressFullName, getAddressSummary } from "@/types/address";

interface AddressCardProps {
  address: UserAddress;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

function AddressDetails({
  address,
  selected,
}: {
  address: UserAddress;
  selected: boolean;
}) {
  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
            selected ? "bg-white/15 text-white" : "bg-[#F4F4F4] text-neutral-800",
          )}
        >
          {address.label || "Home"}
        </span>
        {address.isDefault && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
              selected ? "bg-white text-neutral-950" : "bg-black text-white",
            )}
          >
            Default
          </span>
        )}
      </div>

      <div className={cn("mt-3 space-y-1.5", selected ? "text-white/90" : "text-neutral-700")}>
        <p className={cn("text-sm font-bold", selected ? "text-white" : "text-black")}>
          {getAddressFullName(address)}
        </p>
        <p className="text-xs font-medium leading-relaxed">{getAddressSummary(address)}</p>
        {address.phone && <p className="pt-0.5 text-xs font-semibold">{address.phone}</p>}
      </div>
    </>
  );
}

export function AddressCard({
  address,
  selected = false,
  selectable = false,
  onSelect,
  onEdit,
  compact = false,
}: AddressCardProps) {
  const cardClassName = cn(
    "relative w-full rounded-3xl border p-4 text-left transition-all duration-300 sm:p-5",
    selectable
      ? selected
        ? "border-neutral-950 bg-neutral-950 text-white shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]"
        : "border-gray-200/80 bg-white text-black shadow-2xs hover:border-neutral-300"
      : "border-gray-200/80 bg-white text-black shadow-2xs",
    compact && "p-4",
  );

  if (selectable) {
    return (
      <div className={cardClassName}>
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className="min-w-0 flex-1 text-left"
          >
            <AddressDetails address={address} selected={selected} />
          </button>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                  selected
                    ? "border-white/25 text-white hover:bg-white/10"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-950 hover:text-black",
                )}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <AddressDetails address={address} selected={false} />
    </div>
  );
}
