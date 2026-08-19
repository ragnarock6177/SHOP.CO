"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";

export function TopSelling() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProductsApi({ limit: 12 })
      .then(({ products }) => {
        if (products.length > 0) {
          setProducts(products.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-white py-8 sm:py-14 px-3 sm:px-8 max-w-7xl mx-auto border-b border-black/10 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <span className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase block mb-1 font-be-vietnam-pro">
          MOST-COVETED PIECES
        </span>
        <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight leading-tight">
          TOP SELLING
        </h2>
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

      {/* View All Button */}
      <div className="w-full flex justify-center mt-6 sm:mt-10">
        <Link
          href="/product?sort=rating"
          className="w-full sm:w-60 h-10 sm:h-12 bg-white border border-black/15 rounded-full font-be-vietnam-pro font-bold text-black hover:bg-black hover:text-white text-xs cursor-pointer transition-all duration-300 shadow-xs hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <span>View All Bestsellers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
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
