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
    <section className="w-full bg-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            {subtitle && (
              <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1.5 font-be-vietnam-pro">
                {subtitle}
              </span>
            )}
            <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black uppercase text-black tracking-tight">
              {title}
            </h2>
          </div>
          <Link
            href="/product"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:opacity-70 transition-opacity"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
