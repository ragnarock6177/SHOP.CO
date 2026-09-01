"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Heart, Eye, ShoppingBag, Check, Zap } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

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

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWished = isInWishlist(product.id);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ""
  );

  // Secondary image for hover effect
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColor || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, selectedColor || undefined);
    router.push("/checkout");
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-black text-black" />;
          } else if (i === fullStars && hasHalfStar) {
            return <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-black text-black opacity-60" />;
          }
          return <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-200 fill-gray-200" />;
        })}
      </div>
    );
  };

  return (
    <div className="group flex flex-col justify-between space-y-1.5 relative select-none w-full">
      {/* Compact 3:4 Aspect Ratio Image Container */}
      <div className="relative w-full aspect-3/4 bg-[#F0EEED] rounded-xl overflow-hidden cursor-pointer border border-gray-100 shrink-0">
        {/* Primary Image */}
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 180px"
          className={`object-cover object-center w-full h-full transition-all duration-500 ${
            secondaryImage ? "group-hover:opacity-0 group-hover:scale-103" : "group-hover:scale-103"
          }`}
        />

        {/* Secondary Image on Hover */}
        {secondaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.title} hover angle`}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 180px"
            className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-103 transition-all duration-500 w-full h-full"
          />
        )}

        {/* Minimalist Black Discount Badge */}
        {product.discount && (
          <div className="absolute top-1.5 left-1.5 bg-black text-white font-be-vietnam-pro font-black text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full z-10 uppercase tracking-wider">
            -{product.discount}%
          </div>
        )}

        {/* Top-Right Wishlist & Quick View */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1 sm:p-1.5 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isWished
                ? "bg-black text-white scale-105"
                : "bg-white/90 text-black hover:bg-black hover:text-white"
            }`}
            title={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-3 h-3 ${isWished ? "fill-current" : ""}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-1 sm:p-1.5 rounded-full bg-white/90 text-black hover:bg-black hover:text-white backdrop-blur-md transition-all shadow-xs opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 duration-200"
              title="Quick View"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Ultra-Compact On Hover Action Buttons: Add to Cart & Buy Now */}
        <div className="absolute bottom-1 left-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-y-1.5 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-1 px-1 rounded-md bg-black text-white font-be-vietnam-pro font-bold text-[8px] sm:text-[10px] flex items-center justify-center gap-0.5 shadow-md hover:bg-neutral-800 active:scale-95 transition-all truncate"
            title="Add to Cart"
          >
            {added ? (
              <>
                <Check className="w-2.5 h-2.5 shrink-0" /> <span className="truncate">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-2.5 h-2.5 shrink-0" /> <span className="truncate">Add</span>
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 py-1 px-1 rounded-md bg-white text-black font-be-vietnam-pro font-bold text-[8px] sm:text-[10px] flex items-center justify-center gap-0.5 shadow-md hover:bg-gray-100 active:scale-95 transition-all border border-black/10 truncate"
            title="Buy Now"
          >
            <Zap className="w-2.5 h-2.5 fill-black shrink-0" /> <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="space-y-0.5 pt-0.5">
        {/* Color Swatches (Only if multiple colors exist) */}
        {product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1 pb-0.5">
            {product.colors.map((col) => (
              <button
                key={col.name}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor(col.name);
                }}
                style={{ backgroundColor: col.hex }}
                className={`w-2 h-2 rounded-full border transition-all ${
                  selectedColor === col.name ? "border-black ring-1 ring-black" : "border-gray-300"
                }`}
                title={col.name}
              />
            ))}
          </div>
        )}

        {/* Product Title */}
        <Link href={`/product/${product.slug || product.id}`}>
          <h3 className="font-be-vietnam-pro font-semibold text-[11px] sm:text-xs text-black group-hover:text-neutral-600 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating Score */}
        <div className="flex items-center gap-1 font-be-vietnam-pro text-[10px]">
          {renderStars(product.rating)}
          <span className="font-bold text-black text-[9px] ml-0.5">
            {product.rating}<span className="text-gray-400 font-normal text-[8px]">/5</span>
          </span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-center gap-1 pt-0.5 font-be-vietnam-pro">
          <span className="font-black text-xs sm:text-sm text-black">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="font-semibold text-[10px] text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
