"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingBag, Check, Zap } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/context/CartContext";
import { useSizeSelection } from "@/context/SizeSelectionContext";
import { ColorSwatchStack } from "@/components/product/ColorSwatchStack";
import {
  getProductImageProps,
  PLACEHOLDER_IMAGE,
  PRODUCT_CARD_IMAGE_SIZES,
} from "@/lib/productMedia";
import { resolveProductColor } from "@/lib/productVariants";

interface ProductCardProps {
  product: Product;
}

export { PRODUCT_CARD_IMAGE_SIZES, PRODUCT_IMAGE_QUALITY } from "@/lib/productMedia";

export function formatShortSize(size: string): string {
  const s = size.toLowerCase().trim();
  if (s === "small" || s === "s") return "S";
  if (s === "medium" || s === "m") return "M";
  if (s === "large" || s === "l") return "L";
  if (s === "x-large" || s === "xl" || s === "extra large") return "XL";
  if (s === "xx-large" || s === "2xl" || s === "2x-large") return "2XL";
  if (s === "3x-large" || s === "3xl") return "3XL";
  return size;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useCart();
  const { requestBuyNow, requestAddToCart } = useSizeSelection();
  const isWished = isInWishlist(product.id);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    () => resolveProductColor(product) || "",
  );

  const displayImage = useMemo(() => {
    if (selectedColor && product.imagesByColor?.[selectedColor]?.[0]) {
      return product.imagesByColor[selectedColor][0];
    }
    return product.image;
  }, [product.image, product.imagesByColor, selectedColor]);

  const [imageSrc, setImageSrc] = useState(displayImage);

  useEffect(() => {
    setImageSrc(displayImage);
  }, [displayImage]);

  const secondaryImage = useMemo(() => {
    if (selectedColor && product.imagesByColor?.[selectedColor]?.[1]) {
      return product.imagesByColor[selectedColor][1];
    }
    return product.images && product.images.length > 1 ? product.images[1] : null;
  }, [product.images, product.imagesByColor, selectedColor]);

  const productHref = `/product/${product.slug || product.id}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requestAddToCart(product, selectedColor || undefined, 1, {
      onSuccess: () => {
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      },
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requestBuyNow(product, selectedColor || undefined, 1);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-3 w-3 fill-black text-black" />;
          }
          if (i === fullStars && hasHalfStar) {
            return <Star key={i} className="h-3 w-3 fill-black text-black opacity-60" />;
          }
          return <Star key={i} className="h-3 w-3 fill-neutral-200 text-neutral-200" />;
        })}
      </div>
    );
  };

  const primaryImage = imageSrc || PLACEHOLDER_IMAGE;
  const primaryImageProps = getProductImageProps(primaryImage, PRODUCT_CARD_IMAGE_SIZES);
  const secondaryImageProps = secondaryImage
    ? getProductImageProps(secondaryImage, PRODUCT_CARD_IMAGE_SIZES)
    : null;

  return (
    <article className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <Link
        href={productHref}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.title}`}
      />

      <div className="relative aspect-[3/4] overflow-hidden bg-[#F3F2F0]">
        <Image
          src={primaryImage}
          alt={product.title}
          fill
          priority={false}
          unoptimized={primaryImageProps.unoptimized}
          quality={primaryImageProps.quality}
          sizes={primaryImageProps.sizes}
          onError={() => setImageSrc(PLACEHOLDER_IMAGE)}
          className={`object-cover object-center transition-opacity duration-500 ${
            secondaryImage ? "group-hover:opacity-0" : "group-hover:opacity-95"
          }`}
        />

        {secondaryImage && secondaryImageProps && (
          <Image
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            fill
            unoptimized={secondaryImageProps.unoptimized}
            quality={secondaryImageProps.quality}
            sizes={secondaryImageProps.sizes}
            className="absolute inset-0 object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {product.discount ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
            -{product.discount}%
          </div>
        ) : product.isNew ? (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-sm">
            New
          </div>
        ) : null}

        <div className="absolute right-3 top-3 z-[2]">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 shadow-sm ${
              isWished
                ? "border-red-600 bg-red-600 text-white scale-105"
                : "border-white/80 bg-white/95 text-neutral-700 hover:border-red-200 hover:text-red-600"
            }`}
            title={isWished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={isWished}
          >
            <Heart className={`h-4 w-4 ${isWished ? "fill-white text-white" : ""}`} />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 z-[2] flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg transition-colors hover:bg-neutral-800"
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-black shadow-lg transition-colors hover:bg-neutral-50"
          >
            <Zap className="h-3.5 w-3.5 fill-black" /> Buy
          </button>
        </div>
      </div>

      <div className="relative z-0 flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        {product.colors && product.colors.length > 0 && (
          <div className="relative z-[2]">
            <ColorSwatchStack
              colors={product.colors}
              selected={selectedColor}
              onSelect={(name, event) => {
                event.preventDefault();
                event.stopPropagation();
                setSelectedColor(name);
              }}
            />
          </div>
        )}

        <h3 className="font-be-vietnam-pro line-clamp-2 text-sm font-semibold leading-snug text-black transition-colors group-hover:text-neutral-600 sm:text-[15px]">
          {product.title}
        </h3>

        <div className="flex items-center gap-1.5">
          {renderStars(product.rating)}
          {product.reviewsCount > 0 && (
            <span className="text-[11px] text-neutral-400">({product.reviewsCount})</span>
          )}
        </div>

        <div className="mt-auto flex items-end gap-2 pt-1">
          <span className="font-be-vietnam-pro-black text-base font-black text-black sm:text-lg">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="pb-0.5 text-xs font-semibold text-neutral-400 line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
