"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";
import { PRODUCTS } from "@/data/mockData";

const COLLECTIONS = [
  {
    id: "essential-tees",
    title: "HEAVYWEIGHT TEES",
    subtitle: "240 GSM Luxury Cotton Fits",
    itemCount: "42 Garments",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
    link: "/product?category=t-shirts",
  },
  {
    id: "oversized-hoodies",
    title: "OVERSIZED HOODIES",
    subtitle: "French Terry Fleece Tailoring",
    itemCount: "38 Garments",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
    link: "/product?category=hoodies",
  },
  {
    id: "tailored-trousers",
    title: "MINIMALIST BOTTOMS",
    subtitle: "Relaxed Fit Cargo & Trousers",
    itemCount: "29 Garments",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80",
    link: "/product?category=pants",
  },
];

export const CuratedCollections: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <section className="w-full bg-[#FBFBFB] py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-6 border-y border-gray-200/80">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1.5 font-be-vietnam-pro">
              CURATED PRODUCT LINEUPS
            </span>
            <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-black tracking-tight">
              CURATED COLLECTIONS
            </h2>
          </div>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:opacity-70 transition-opacity"
          >
            <span>Explore All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Column Collection Banner Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {COLLECTIONS.map((col) => (
            <Link key={col.id} href={col.link} className="group block">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-500">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent p-5 sm:p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-300 mb-1">
                    {col.itemCount}
                  </span>
                  <h3 className="font-be-vietnam-pro-black text-xl sm:text-2xl font-black uppercase tracking-tight mb-1">
                    {col.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-be-vietnam-pro mb-3">
                    {col.subtitle}
                  </p>

                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase text-white group-hover:translate-x-1 transition-transform">
                    <span>Shop Lineup</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Collection Garments Grid (3 Columns Mobile / 6 Columns Desktop) */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h4 className="font-be-vietnam-pro-black text-base sm:text-lg font-black uppercase text-black">
              Featured Lineup Pieces
            </h4>
            <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Handcrafted Luxury Essentials</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {PRODUCTS.slice(0, 6).map((product) => (
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

export default CuratedCollections;
