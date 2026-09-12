"use client";

import Link from "next/link";
import { Heart, ShoppingBag, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const countBadgeClasses =
  "absolute -right-0.5 -top-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold tabular-nums leading-none text-white ring-2 ring-white shadow-sm";

interface NavActionIconLinkProps {
  href: string;
  label: string;
  count?: number;
  isActive: boolean;
  icon: LucideIcon;
  fillWhenActive?: boolean;
}

export function NavActionIconLink({
  href,
  label,
  count = 0,
  isActive,
  icon: Icon,
  fillWhenActive = false,
}: NavActionIconLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
      title={label}
      className={cn(
        "group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ease-out",
        isActive
          ? "bg-neutral-950 text-white shadow-[0_8px_28px_-10px_rgba(0,0,0,0.45)]"
          : "text-neutral-900 hover:bg-neutral-100/90",
      )}
    >
      <Icon
        className={cn(
          "transition-all duration-300 ease-out",
          isActive
            ? cn(
                "h-[18px] w-[18px] text-white",
                fillWhenActive ? "fill-white stroke-white" : "fill-none stroke-white",
              )
            : "h-[19px] w-[19px] fill-none stroke-neutral-900 group-hover:scale-[1.03]",
        )}
        strokeWidth={isActive ? 2.25 : 1.75}
      />

      {isActive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10"
        />
      )}

      {count > 0 && (
        <span className={countBadgeClasses}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

interface NavActionMobileLinkProps {
  href: string;
  label: string;
  count?: number;
  isActive: boolean;
  icon: LucideIcon;
  onClick?: () => void;
}

export function NavActionMobileLink({
  href,
  label,
  count = 0,
  isActive,
  icon: Icon,
  onClick,
}: NavActionMobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "mb-1.5 flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-300",
        isActive
          ? "border-neutral-200 bg-neutral-50 text-neutral-950 shadow-[inset_3px_0_0_0_#0a0a0a]"
          : "border-transparent text-neutral-700 hover:border-neutral-100 hover:bg-neutral-50/80 hover:text-neutral-950",
      )}
    >
      <span className="flex items-center gap-2.5 text-[13px] font-semibold tracking-wide">
        <Icon
          className={cn(
            "h-4 w-4 fill-none",
            isActive ? "stroke-neutral-950" : "stroke-neutral-600",
          )}
          strokeWidth={isActive ? 2.25 : 1.75}
        />
        <span>{label}</span>
        {count > 0 && (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold tabular-nums text-white">
            {count}
          </span>
        )}
      </span>
    </Link>
  );
}

export { Heart, ShoppingBag };
