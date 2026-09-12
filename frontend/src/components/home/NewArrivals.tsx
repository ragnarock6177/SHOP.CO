"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { ProductCard } from "@/components/product/ProductCard";
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

  const displayTitle = section?.title || "NEW ARRIVALS";
  const displaySubtitle = section?.subtitle || "LATEST SEASONAL ARRIVALS";

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setAllProducts(initialProducts);
      setFilteredProducts(initialProducts.slice(0, limit));
      return;
    }

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
    <section className="w-full bg-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 my-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
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
            href="/product?sort=newest"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-black hover:opacity-70 transition-opacity"
          >
            <span>Explore All New Arrivals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Sleek Mobile Horizontal Scroll Category Chips */}
        <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-2 sm:pb-0 mb-6 sm:mb-8">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
