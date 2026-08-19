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
    <section className="w-full bg-linear-to-b from-[#111111] to-black text-white py-14 px-4 sm:px-10 lg:px-16 overflow-hidden relative my-6">
      {/* Background Decorative Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Row: Title, Countdown Clock & Coupon Banner */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-10 border-b border-white/10 mb-10">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>LIMITED TIME DROP</span>
            </div>
            <h2 className="font-be-vietnam-pro-black text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
              FLASH SALE — UP TO 50% OFF
            </h2>
            <p className="text-gray-400 text-sm max-w-lg font-be-vietnam-pro">
              Grab premium luxury garments at unprecedented prices before stock runs out.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Timer className="w-5 h-5 text-amber-400" />
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
                <span className="text-xl sm:text-2xl font-black block text-red-600">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase block">SECS</span>
              </div>
            </div>

            {/* Claim Coupon Button */}
            <button
              onClick={handleCopyCoupon}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFC633] hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" /> Code FLASH25 Copied!
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-3 sm:p-4 text-black shadow-xl">
              {/* Limited Stock Meter */}
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-red-600">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Almost Sold Out
                </span>
                <span>4 Left</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-3">
                <div className="bg-red-500 h-full w-[85%] rounded-full animate-pulse" />
              </div>

              <ProductCard
                product={{
                  ...product,
                  discount: product.discount || 30,
                  originalPrice: product.originalPrice || Math.round(product.price * 1.4),
                }}
                onQuickView={setQuickViewProduct}
              />
            </div>
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
