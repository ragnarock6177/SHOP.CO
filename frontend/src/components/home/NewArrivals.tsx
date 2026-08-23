"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";

import { StorefrontHomepageSection } from "@/types/settings";

const CATEGORY_TABS = [
  { id: "all", label: "All New Drops" },
  { id: "t-shirts", label: "T-Shirts & Tops" },
  { id: "casual", label: "Casual Wear" },
  { id: "hoodies", label: "Hoodies & Jackets" },
];

interface NewArrivalsProps {
  section?: StorefrontHomepageSection;
  initialProducts?: Product[];
}

export function NewArrivals({ section, initialProducts = [] }: NewArrivalsProps) {
  const limit = section?.config?.limit || 6;
  const selectionMode = section?.config?.selectionMode || "LATEST";

  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    initialProducts.slice(0, limit)
  );
  const [activeTab, setActiveTab] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const displayTitle = section?.title || "NEW ARRIVALS";
  const displaySubtitle = section?.subtitle || "LATEST SEASONAL ARRIVALS";

  useEffect(() => {
    getProductsApi({ limit: 12, selectionMode })
      .then(({ products }) => {
        if (products.length > 0) {
          setAllProducts(products);
          setFilteredProducts(products.slice(0, limit));
        }
      })
      .catch(() => {});
  }, [limit, selectionMode]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "all") {
      setFilteredProducts(allProducts.slice(0, 6));
    } else {
      const filtered = allProducts.filter((p) =>
        p.category.toLowerCase().includes(tabId) ||
        p.title.toLowerCase().includes(tabId)
      );
      setFilteredProducts(filtered.length > 0 ? filtered.slice(0, 6) : allProducts.slice(0, 6));
    }
  };

  return (
    <section className="w-full bg-white py-8 sm:py-14 px-3 sm:px-8 max-w-7xl mx-auto border-black/10 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-7">
        {displaySubtitle && (
          <span className="text-[9px] sm:text-xs font-bold tracking-widest text-gray-500 uppercase block mb-1 font-be-vietnam-pro">
            {displaySubtitle}
          </span>
        )}
        <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl lg:text-4xl font-black text-black uppercase tracking-tight leading-tight">
          {displayTitle}
        </h2>
      </div>

      {/* Sleek Mobile Horizontal Scroll Category Chips */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-2 sm:pb-0 mb-6 sm:mb-8 px-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-black text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3-Column Mobile / 6-Column Desktop Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
        {filteredProducts.map((product) => (
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
          href="/product?sort=newest"
          className="w-full sm:w-60 h-10 sm:h-12 bg-white border border-black/15 rounded-full font-be-vietnam-pro font-bold text-black hover:bg-black hover:text-white text-xs cursor-pointer transition-all duration-300 shadow-xs hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <span>View All New Arrivals</span>
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

export default NewArrivals;
