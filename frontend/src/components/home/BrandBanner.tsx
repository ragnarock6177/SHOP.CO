"use client";

import React, { useState, useEffect } from "react";
import { StorefrontBrandMarqueeItem } from "@/types/settings";
import { getStorefrontSettingsApi } from "@/lib/settingsApi";

interface BrandBannerProps {
  brands?: StorefrontBrandMarqueeItem[];
}

const DEFAULT_MARQUEE: StorefrontBrandMarqueeItem[] = [
  { name: "VERSACE", isBrand: true },
  { name: "PREMIUM HEAVYWEIGHT COTTON", isBrand: false },
  { name: "GUCCI", isBrand: true },
  { name: "FREE WORLDWIDE EXPRESS SHIPPING", isBrand: false },
  { name: "PRADA", isBrand: true },
  { name: "ETHICALLY CRAFTED ATELIER", isBrand: false },
  { name: "NIKE", isBrand: true },
  { name: "30-DAY COMPLIMENTARY RETURNS", isBrand: false },
  { name: "ZARA", isBrand: true },
  { name: "CALVIN KLEIN", isBrand: true },
];

export function BrandBanner({ brands: initialBrands }: BrandBannerProps) {
  const [items, setItems] = useState<StorefrontBrandMarqueeItem[]>(
    initialBrands && initialBrands.length > 0 ? initialBrands : DEFAULT_MARQUEE
  );

  useEffect(() => {
    if (initialBrands && initialBrands.length > 0) {
      setItems(initialBrands);
    } else {
      getStorefrontSettingsApi()
        .then((res) => {
          if (res?.home?.brandMarquee && res.home.brandMarquee.length > 0) {
            setItems(res.home.brandMarquee);
          }
        })
        .catch(() => {});
    }
  }, [initialBrands]);

  if (!items || items.length === 0) return null;

  return (
    <div className="relative z-20 w-full bg-black py-3.5 overflow-hidden flex items-center border-y border-white/10 select-none gpu-layer">
      <div className="animate-marquee flex items-center">
        {[...items, ...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center gap-10 sm:gap-14 pr-10 sm:pr-14 shrink-0">
            {item.isBrand ? (
              <span className="font-be-vietnam-pro-black text-sm sm:text-base tracking-widest text-white uppercase font-black opacity-95 hover:opacity-100 transition-opacity">
                {item.name}
              </span>
            ) : (
              <span className="font-be-vietnam-pro text-[11px] sm:text-xs tracking-widest text-gray-400 uppercase font-bold">
                {item.name}
              </span>
            )}
            <span className="text-white/20 text-xs">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandBanner;
