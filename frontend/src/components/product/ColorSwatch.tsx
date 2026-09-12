"use client";

import { Check } from "lucide-react";
import { isLightColor } from "@/lib/colorUtils";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  hex: string;
  selected: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "xs" | "sm" | "md";
  stacked?: boolean;
  stackIndex?: number;
  stackTotal?: number;
  className?: string;
}

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-7 w-7",
  md: "h-9 w-9 sm:h-10 sm:w-10",
};

export function ColorSwatch({
  name,
  hex,
  selected,
  onClick,
  size = "md",
  stacked = false,
  stackIndex = 0,
  stackTotal = 1,
  className,
}: ColorSwatchProps) {
  const light = isLightColor(hex);
  const stackZIndex = selected ? 30 : stackTotal - stackIndex;

  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      aria-label={`Select ${name}`}
      aria-pressed={selected}
      style={{ backgroundColor: hex, zIndex: stacked ? stackZIndex : undefined }}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200",
        sizeClasses[size],
        stacked
          ? cn(
              "border shadow-[0_0_0_1.5px_#fff,0_1px_2px_rgba(0,0,0,0.1)]",
              light ? "border-neutral-300" : "border-transparent",
              selected ? "scale-110" : "opacity-90 hover:scale-105 hover:z-20 hover:opacity-100",
            )
          : cn(
              light
                ? "border-neutral-300 bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)]"
                : "border-neutral-200/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]",
              selected
                ? "scale-105 border-black ring-2 ring-black ring-offset-2 shadow-md"
                : "hover:scale-105 hover:border-neutral-400",
            ),
        className,
      )}
    >
      {selected && size !== "xs" && (
        <Check
          className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", light ? "text-black" : "text-white")}
          strokeWidth={3}
        />
      )}
    </button>
  );
}
