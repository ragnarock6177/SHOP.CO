"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";

import { StorefrontHomepageSection } from "@/types/settings";

interface TopSellingProps {
  section?: StorefrontHomepageSection;
  initialProducts?: Product[];
}

export function TopSelling({ section, initialProducts = [] }: TopSellingProps) {
  const limit = section?.config?.limit || 6;
  const selectionMode = section?.config?.selectionMode || "BEST_SELLING";

  const [products, setProducts] = useState<Product[]>(initialProducts.slice(0, limit));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const displayTitle = section?.title || "TOP SELLING";
  const displaySubtitle = section?.subtitle || "MOST-COVETED PIECES";

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts.slice(0, limit));
      return;
    }

    getProductsApi({ limit, selectionMode, sortBy: "rating" })
      .then(({ products: fetched }) => {
        if (fetched.length > 0) {
          setProducts(fetched.slice(0, limit));
        }
      })
      .catch(() => { });
  }, [limit, selectionMode]);

  return (
    <section className="w-full bg-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
          <Link
            href="/product?sort=rating"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:opacity-70 transition-opacity"
          >
            <span>Explore All Bestsellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3-Column Mobile / 6-Column Desktop Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}

export default TopSelling;
