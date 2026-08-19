"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";
import { PRODUCTS } from "@/data/mockData";

export const EditorialShowcase: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const featuredItems = PRODUCTS.slice(0, 6);

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-4">
      <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* Editorial Split Hero Banner */}
        <div className="bg-black text-white rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
          {/* Left Column: Campaign Media */}
          <div className="relative lg:col-span-7 aspect-[4/3] lg:aspect-auto min-h-[260px] sm:min-h-[320px]">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
              alt="Editorial Campaign"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* Right Column: Editorial Text & CTAs */}
          <div className="lg:col-span-5 p-6 sm:p-12 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-gray-400 uppercase block mb-2 sm:mb-3 font-be-vietnam-pro">
                EDITORIAL CAMPAIGN '26
              </span>
              <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight tracking-tight mb-3 sm:mb-4">
                THE MONOCHROME EDIT
              </h2>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed font-be-vietnam-pro">
                Stripped of noise, focused strictly on form, structure, and premium fabric weight. Discover our latest minimalist tailoring designed for elevated daily wear.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-3 sm:py-4 border-y border-white/10 text-[11px] sm:text-xs font-bold">
                <div>
                  <span className="text-gray-400 block text-[9px] sm:text-[10px] uppercase">Fabrication</span>
                  <span className="text-white">100% Organic Heavy Cotton</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] sm:text-[10px] uppercase">Fit Profile</span>
                  <span className="text-white">Relaxed Architectural Cut</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/product"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-white text-black font-extrabold text-xs flex items-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <span>Shop The Edit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Editorial Products Row (3 Columns Mobile / 6 Columns Desktop) */}
        <div>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1 font-be-vietnam-pro">
                FEATURED IN THIS EDITORIAL
              </span>
              <h3 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black uppercase text-black">
                CAMPAIGN SELECTIONS
              </h3>
            </div>
            <Link
              href="/product"
              className="text-xs font-bold uppercase text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {featuredItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};

export default EditorialShowcase;
