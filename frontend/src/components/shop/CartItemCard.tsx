"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types/ecommerce";
import { ProductSizeSelect } from "@/components/shop/ProductSizeSelect";
import {
  getPrimaryImageForColor,
  getProductImageProps,
  PRODUCT_CARD_IMAGE_SIZES,
} from "@/lib/productMedia";
import { productRequiresSize, getCartItemMaxQuantity } from "@/lib/productVariants";
import { formatINR } from "@/lib/formatPrice";

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onSizeChange?: (size: string, variantId?: string) => void;
}

export function CartItemCard({
  item,
  onRemove,
  onIncrease,
  onDecrease,
  onSizeChange,
}: CartItemCardProps) {
  const imageSrc = getPrimaryImageForColor(item.product, item.selectedColor);
  const imageProps = getProductImageProps(imageSrc, PRODUCT_CARD_IMAGE_SIZES);
  const productHref = `/product/${item.product.slug || item.product.id}`;
  const lineTotal = item.product.price * item.quantity;
  const showSizeSelect = productRequiresSize(item.product);
  const maxQuantity = getCartItemMaxQuantity(item);
  const atMaxQuantity = maxQuantity > 0 && item.quantity >= maxQuantity;
  const isLowStock = maxQuantity > 0 && maxQuantity <= 5;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        <Link
          href={productHref}
          className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F3F2F0] sm:h-36 sm:w-28"
        >
          <Image
            src={imageSrc}
            alt={item.product.title}
            fill
            unoptimized={imageProps.unoptimized}
            quality={imageProps.quality}
            sizes={imageProps.sizes}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <Link href={productHref}>
                <h3 className="font-be-vietnam-pro line-clamp-2 text-sm font-semibold leading-snug text-black transition-colors hover:text-neutral-600 sm:text-[15px]">
                  {item.product.title}
                </h3>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {item.selectedColor && (
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-neutral-600">
                    {item.selectedColor}
                  </span>
                )}
                {showSizeSelect && onSizeChange && (
                  <ProductSizeSelect
                    product={item.product}
                    selectedColor={item.selectedColor}
                    selectedSize={item.selectedSize}
                    onSizeChange={onSizeChange}
                    variant="pill"
                  />
                )}
              </div>

              {isLowStock && (
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Only {maxQuantity} left!
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onRemove}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Remove item"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-neutral-500">Unit price</p>
              <p className="font-be-vietnam-pro-black text-sm font-black text-black sm:text-base">
                {formatINR(item.product.price)}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-1 py-1">
                <button
                  type="button"
                  onClick={onDecrease}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[2rem] text-center text-xs font-bold text-black">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={onIncrease}
                  disabled={atMaxQuantity}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-right">
                <p className="text-[11px] font-medium text-neutral-500">Total</p>
                <p className="font-be-vietnam-pro-black text-sm font-black text-black sm:text-base">
                  {formatINR(lineTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
