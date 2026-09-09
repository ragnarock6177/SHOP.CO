"use client";

import React from "react";
import Image from "next/image";
import { ProductSizeSelect } from "@/components/shop/ProductSizeSelect";
import { CartItem } from "@/types/ecommerce";
import { productRequiresSize } from "@/lib/productVariants";
import {
  getPrimaryImageForColor,
  getProductImageProps,
  PRODUCT_CARD_IMAGE_SIZES,
} from "@/lib/productMedia";
import { formatINR } from "@/lib/formatPrice";

interface CheckoutOrderItemProps {
  item: CartItem;
  itemIndex: number;
  onSizeChange: (
    itemIndex: number,
    selection: { size: string; variantId?: string },
  ) => void;
}

export function CheckoutOrderItem({ item, itemIndex, onSizeChange }: CheckoutOrderItemProps) {
  const imageSrc = getPrimaryImageForColor(item.product, item.selectedColor);
  const imageProps = getProductImageProps(imageSrc, PRODUCT_CARD_IMAGE_SIZES);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-[#FAFAF9] p-3 text-xs">
      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-[#F0EEED]">
        <Image
          src={imageSrc}
          alt={item.product.title}
          fill
          unoptimized={imageProps.unoptimized}
          quality={imageProps.quality}
          sizes={imageProps.sizes}
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h5 className="truncate font-bold text-black">{item.product.title}</h5>
            <p className="mt-0.5 text-[11px] font-medium text-gray-500">
              Qty: {item.quantity}
              {item.selectedColor ? ` • ${item.selectedColor}` : ""}
            </p>
          </div>
          <span className="shrink-0 font-black text-black">
            {formatINR(item.product.price * item.quantity)}
          </span>
        </div>

        {productRequiresSize(item.product) && (
          <ProductSizeSelect
            product={item.product}
            selectedColor={item.selectedColor}
            selectedSize={item.selectedSize}
            onSizeChange={(size, variantId) => onSizeChange(itemIndex, { size, variantId })}
          />
        )}
      </div>
    </div>
  );
}
