"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types/ecommerce";

import { getProductsApi } from "@/lib/productApi";
import { StorefrontHomepageSection } from "@/types/settings";

interface PersonalizedRecommendationsProps {
  section?: StorefrontHomepageSection;
  initialProducts?: Product[];
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  section,
  initialProducts = [],
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayTitle = section?.title || "RECOMMENDED FOR YOU";
  const displaySubtitle = section?.subtitle || "TAILORED RECOMMENDATIONS";
  const limit = section?.config?.limit || 8;

  React.useEffect(() => {
    if (initialProducts.length > 0) return;

    getProductsApi({ limit, sortBy: "rating" })
      .then(({ products: fetched }) => {
        setProducts(fetched);
      })
      .catch(() => {
        setProducts([]);
      });
  }, [limit, initialProducts.length]);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -180 : 180;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Navigation Arrows */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            {displaySubtitle && (
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1.5 font-be-vietnam-pro">
                {displaySubtitle}
              </span>
            )}
            <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-black tracking-tight">
              {displayTitle}
            </h2>
          </div>

          {/* Controls: Explore All + Prev / Next Slider Arrows */}
          <div className="flex items-center gap-4">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:opacity-70 transition-opacity"
            >
              <span>Explore All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors shadow-xs cursor-pointer"
                aria-label="Previous Products"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-black hover:text-white transition-colors shadow-xs cursor-pointer"
                aria-label="Next Products"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Compact Product Scroll Track */}
        <div
          ref={sliderRef}
          className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 touch-pan-x gpu-layer"
        >
          {products.map((product) => (
            <div key={product.id} className="w-32 sm:w-44 lg:w-48 shrink-0">
              <ProductCard
                product={product}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
