"use client";

import React from "react";

const BRANDS_AND_USPS = [
  { name: "VERSACE", isBrand: true },
  { name: "PREMIUM HEAVYWEIGHT COTTON", isBrand: false },
  { name: "GUCCI", isBrand: true },
  { name: "FREE WORLDWIDE EXPRESS SHIPPING", isBrand: false },
  { name: "PRADA", isBrand: true },
  { name: "ETHICALLY CRAFTED ATELIER", isBrand: false },
  { name: "NIKE", isBrand: true },
  { name: "30-DAY COMPLIMENTARY RETURNS", isBrand: false },
  { name: "ZARA", isBrand: true },
  { name: "LIMITED EDITION DROPS", isBrand: false },
  { name: "CALVIN KLEIN", isBrand: true },
  { name: "LUXURY FIT & SILHOUETTE", isBrand: false },
];

export function BrandBanner() {
  return (
    <div className="relative z-20 w-full bg-black py-3.5 overflow-hidden flex items-center border-y border-white/10 select-none gpu-layer">
      <div className="animate-marquee flex items-center">
        {[...BRANDS_AND_USPS, ...BRANDS_AND_USPS].map((item, index) => (
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
