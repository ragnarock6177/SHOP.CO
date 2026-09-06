"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, Flame, Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { Product } from "@/types/ecommerce";
import { PRODUCTS } from "@/data/mockData";

export const PromoCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [copied, setCopied] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Real-time countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("FLASH25");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Select on-sale or flash products
  const flashProducts = PRODUCTS.slice(0, 4);

  return (
    <section className="w-full bg-[#111111] text-white py-12 sm:py-16 px-3 sm:px-8 lg:px-12 overflow-hidden relative my-6 border-y border-white/10">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Row: Title, Countdown Clock & Coupon Banner */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-8 sm:mb-12">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-gray-400 uppercase block mb-1.5 font-be-vietnam-pro">
              LIMITED TIME DROP
            </span>
            <h2 className="font-be-vietnam-pro-black text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">
              FLASH SALE — UP TO 50% OFF
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-lg font-be-vietnam-pro">
              Grab premium luxury garments at unprecedented prices before stock runs out.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 text-white/70 font-bold text-xs font-be-vietnam-pro">
              <Timer className="w-4 h-4 text-white/70" />
              <span>ENDS IN:</span>
            </div>

            <div className="flex items-center gap-2 text-center">
              <div className="bg-white text-black rounded-xl px-3 py-2 font-be-vietnam-pro-black min-w-[52px]">
                <span className="text-xl sm:text-2xl font-black block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase block">HRS</span>
              </div>
              <span className="text-xl font-bold text-white/40">:</span>
              <div className="bg-white text-black rounded-xl px-3 py-2 font-be-vietnam-pro-black min-w-[52px]">
                <span className="text-xl sm:text-2xl font-black block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase block">MINS</span>
              </div>
              <span className="text-xl font-bold text-white/40">:</span>
              <div className="bg-white text-black rounded-xl px-3 py-2 font-be-vietnam-pro-black min-w-[52px]">
                <span className="text-xl sm:text-2xl font-black block text-black">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase block">SECS</span>
              </div>
            </div>

            {/* Claim Coupon Button */}
            <button
              onClick={handleCopyCoupon}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-gray-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer font-be-vietnam-pro"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" /> Code FLASH25 Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Use Code: FLASH25 (Extra 25% OFF)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Flash Deals Product Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {flashProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                discount: product.discount || 30,
                originalPrice: product.originalPrice || Math.round(product.price * 1.4),
              }}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>

        {/* View All Flash Items */}
        <div className="mt-10 text-center">
          <Link
            href="/product?filter=on-sale"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all shadow-lg group cursor-pointer"
          >
            <span>Explore All Flash Deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};

export default PromoCountdown;
