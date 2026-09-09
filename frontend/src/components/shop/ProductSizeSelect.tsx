"use client";

import React, { useMemo } from "react";
import { Product } from "@/types/ecommerce";
import { CustomSelect } from "@/components/ui/select";
import {
  getAvailableSizes,
  getSizeStock,
  productRequiresSize,
  resolveVariant,
} from "@/lib/productVariants";
import { cn } from "@/lib/utils";

interface ProductSizeSelectProps {
  product: Product;
  selectedColor?: string;
  selectedSize?: string;
  onSizeChange: (size: string, variantId?: string) => void;
  variant?: "default" | "pill";
  className?: string;
}

export function ProductSizeSelect({
  product,
  selectedColor,
  selectedSize,
  onSizeChange,
  variant = "default",
  className,
}: ProductSizeSelectProps) {
  const isPill = variant === "pill";

  const options = useMemo(() => {
    if (!productRequiresSize(product)) return [];

    const sizes = getAvailableSizes(product, selectedColor);
    return sizes.map((size) => {
      const stock = getSizeStock(product, size, selectedColor);
      const sizeLabel = isPill ? `Size ${size}` : size;
      let label = sizeLabel;

      if (!isPill) {
        if (stock <= 0) label = `${size} — Out of stock`;
        else if (stock <= 5) label = `${size} — ${stock} left`;
      } else if (stock <= 0) {
        label = `${sizeLabel} — Out of stock`;
      }

      return {
        value: size,
        label,
        disabled: stock <= 0,
      };
    });
  }, [product, selectedColor, isPill]);

  if (!productRequiresSize(product)) return null;

  const handleChange = (size: string) => {
    if (!size) return;
    const resolved = resolveVariant(product, selectedColor, size);
    onSizeChange(size, resolved?.id);
  };

  return (
    <div className={cn(isPill ? "inline-block min-w-[108px]" : "max-w-[180px]", className)}>
      {!isPill && (
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.08em] text-gray-500">
          Size
        </label>
      )}
      <CustomSelect
        value={selectedSize || ""}
        onChange={handleChange}
        options={options}
        placeholder="Size"
        triggerClassName={cn(
          isPill
            ? "h-8 min-w-[108px] rounded-full border-neutral-200 bg-neutral-50 px-2.5 text-[10px] font-semibold text-neutral-700 shadow-none hover:bg-neutral-100"
            : "h-9 rounded-full border-neutral-200 bg-white text-[11px] font-bold text-black shadow-none hover:bg-neutral-50",
        )}
        contentClassName="min-w-[140px]"
      />
    </div>
  );
}
