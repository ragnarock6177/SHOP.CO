"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Ruler, AlertCircle } from "lucide-react";
import { Product } from "@/types/ecommerce";
import {
  getAvailableSizes,
  getSizeStock,
  getVariantPrice,
  productRequiresSize,
  resolveProductColor,
  resolveVariant,
} from "@/lib/productVariants";
import { getPrimaryImageForColor } from "@/lib/productMedia";
import { cn } from "@/lib/utils";

interface SizeSelectionModalProps {
  open: boolean;
  product: Product | null;
  initialColor?: string;
  quantity?: number;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (selection: { color?: string; size?: string; variantId?: string }) => void;
}

export function SizeSelectionModal({
  open,
  product,
  initialColor,
  quantity = 1,
  title = "Select your size",
  subtitle = "Your color is already selected. Pick a size to continue.",
  confirmLabel = "Continue",
  onClose,
  onConfirm,
}: SizeSelectionModalProps) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");

  const resolvedInitialColor = useMemo(
    () => (product ? resolveProductColor(product, initialColor) : undefined),
    [product, initialColor],
  );

  useEffect(() => {
    if (!open || !product) return;
    setSelectedColor(resolvedInitialColor || "");
    setSelectedSize("");
    setError("");
  }, [open, product, resolvedInitialColor]);

  if (!product) return null;

  const hasMultipleColors = (product.colors?.length ?? 0) > 1;
  const sizes = productRequiresSize(product)
    ? getAvailableSizes(product, selectedColor || undefined)
    : [];
  const imageSrc = getPrimaryImageForColor(product, selectedColor || undefined);
  const activeVariant = selectedSize
    ? resolveVariant(product, selectedColor || undefined, selectedSize)
    : null;
  const displayPrice = getVariantPrice(product, activeVariant);

  const handleConfirm = () => {
    if (!selectedSize) {
      setError("Please select a size to continue.");
      return;
    }

    const stock = getSizeStock(product, selectedSize, selectedColor || undefined);
    if (stock <= 0) {
      setError("This size is currently out of stock.");
      return;
    }

    if (stock < quantity) {
      setError(`Only ${stock} left in this size.`);
      return;
    }

    const variant = resolveVariant(
      product,
      selectedColor || undefined,
      selectedSize,
    );

    onConfirm({
      color: selectedColor || undefined,
      size: selectedSize,
      variantId: variant?.id,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close size selection"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-selection-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Size required
                </p>
                <h2 id="size-selection-title" className="font-be-vietnam-pro-black text-lg font-black text-black">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-black hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex gap-4 rounded-2xl border border-neutral-100 bg-[#FAFAF9] p-3">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                  <Image src={imageSrc} alt={product.title} fill className="object-cover" sizes="80px" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold text-black">{product.title}</p>
                  {selectedColor && (
                    <p className="text-xs font-medium capitalize text-neutral-500">Color: {selectedColor}</p>
                  )}
                  {selectedSize && (
                    <p className="text-xs font-medium text-neutral-500">Size: {selectedSize}</p>
                  )}
                  <p className="font-be-vietnam-pro-black text-base font-black text-black">
                    ₹{displayPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {hasMultipleColors && product.colors && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    Switch color (optional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color.name);
                            setSelectedSize("");
                            setError("");
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-neutral-200 bg-white text-black hover:border-black",
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-neutral-200"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="capitalize">{color.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-black" />
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">Choose size</p>
                </div>
                <p className="text-xs leading-relaxed text-neutral-500">{subtitle}</p>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const stock = getSizeStock(product, size, selectedColor || undefined);
                    const isDisabled = stock <= 0;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedSize(size);
                          setError("");
                        }}
                        className={cn(
                          "min-w-[3.25rem] rounded-full border px-4 py-2.5 text-xs font-bold transition-all",
                          isSelected
                            ? "border-black bg-black text-white shadow-md"
                            : isDisabled
                              ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300 line-through"
                              : "border-neutral-200 bg-white text-black hover:border-black",
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {selectedSize && (
                  <p className="text-[11px] font-medium text-neutral-500">
                    {getSizeStock(product, selectedSize, selectedColor || undefined) <= 5
                      ? `Only ${getSizeStock(product, selectedSize, selectedColor || undefined)} left in ${selectedSize}`
                      : `${selectedSize} is available`}
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full rounded-full bg-black py-3.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-800"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
