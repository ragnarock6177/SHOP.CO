"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types/ecommerce";
import {
  getPrimaryImageForColor,
  getProductImageProps,
  PRODUCT_CARD_IMAGE_SIZES,
} from "@/lib/productMedia";
import { resolveProductColor } from "@/lib/productVariants";
import { formatINR } from "@/lib/formatPrice";

interface WishlistItemCardProps {
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  return [...Array(5)].map((_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${i < fullStars ? "fill-black text-black" : "fill-black/20 text-black/20"}`}
    />
  ));
}

export function WishlistItemCard({ product, onRemove, onAddToCart }: WishlistItemCardProps) {
  const color = resolveProductColor(product);
  const imageSrc = getPrimaryImageForColor(product, color);
  const imageProps = getProductImageProps(imageSrc, PRODUCT_CARD_IMAGE_SIZES);
  const productHref = `/product/${product.slug || product.id}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/95 text-red-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-600 hover:text-white"
        title="Remove from wishlist"
        aria-label="Remove from wishlist"
      >
        <Heart className="h-4 w-4 fill-current" />
      </button>

      <Link href={productHref} className="relative block aspect-[3/4] overflow-hidden bg-[#F3F2F0]">
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          unoptimized={imageProps.unoptimized}
          quality={imageProps.quality}
          sizes={imageProps.sizes}
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {product.discount ? (
          <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            -{product.discount}%
          </span>
        ) : product.isNew ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-sm">
            New
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="space-y-1.5">
          <Link href={productHref}>
            <h3 className="font-be-vietnam-pro line-clamp-2 text-sm font-semibold leading-snug text-black transition-colors group-hover:text-neutral-600">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-end gap-2">
            <span className="font-be-vietnam-pro-black text-base font-black text-black">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="pb-0.5 text-xs font-semibold text-neutral-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-black py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-md transition-colors hover:bg-neutral-800"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
