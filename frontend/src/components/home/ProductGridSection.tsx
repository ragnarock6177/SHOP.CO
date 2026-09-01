"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";
import { StorefrontHomepageSection } from "@/types/settings";

interface ProductGridSectionProps {
  section: StorefrontHomepageSection;
  initialProducts?: Product[];
}

export function ProductGridSection({ section, initialProducts = [] }: ProductGridSectionProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const title = section.title || "FEATURED COLLECTION";
  const subtitle = section.subtitle || "Handpicked contemporary styles";
  const limit = section.config?.limit || 6;
  const selectionMode = section.config?.selectionMode || "LATEST";
  const selectedProductIds = section.config?.selectedProductIds;

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    getProductsApi({
      limit,
      selectionMode,
      ids: selectedProductIds,
    })
      .then(({ products: fetched }) => {
        if (isMounted) {
          setProducts(fetched);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [limit, selectionMode, JSON.stringify(selectedProductIds)]);

  return (
    <section className="w-full bg-white py-8 sm:py-14 px-3 sm:px-8 max-w-7xl mx-auto border-b border-black/10 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        {subtitle && (
          <span className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase block mb-1 font-be-vietnam-pro">
            {subtitle}
          </span>
        )}
        <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight leading-tight">
          {title}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {Array.from({ length: limit }).map((_, idx) => (
            <div key={idx} className="aspect-3/4 bg-gray-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400 font-semibold">
          No items found for this collection.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="w-full flex justify-center mt-6 sm:mt-10">
        <Link
          href="/product"
          className="w-full sm:w-60 h-10 sm:h-12 bg-white border border-black/15 rounded-full font-be-vietnam-pro font-bold text-black hover:bg-black hover:text-white text-xs cursor-pointer transition-all duration-300 shadow-xs hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <span>Explore Collection</span>
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

export default ProductGridSection;
