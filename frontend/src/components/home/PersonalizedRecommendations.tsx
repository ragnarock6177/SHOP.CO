"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";
import { PRODUCTS } from "@/data/mockData";

export const PersonalizedRecommendations: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white py-10 sm:py-16 px-3 sm:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Header with Navigation Arrows */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1 font-be-vietnam-pro">
            TAILORED RECOMMENDATIONS
          </span>
          <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl lg:text-4xl font-black uppercase text-black">
            RECOMMENDED FOR YOU
          </h2>
        </div>

        {/* Prev / Next Slider Arrows */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors shadow-xs"
            aria-label="Previous Products"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors shadow-xs"
            aria-label="Next Products"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Compact Product Scroll Track */}
      <div
        ref={sliderRef}
        className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 touch-pan-x gpu-layer"
      >
        {PRODUCTS.map((product) => (
          <div key={product.id} className="w-32 sm:w-44 lg:w-48 shrink-0">
            <ProductCard
              product={product}
              onQuickView={setQuickViewProduct}
            />
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};

export default PersonalizedRecommendations;
