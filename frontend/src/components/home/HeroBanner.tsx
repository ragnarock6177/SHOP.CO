"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/data/mockData";
import { formatShortSize } from "@/components/product/ProductCard";

interface PosterSlide {
  id: string;
  image: string;
  alt: string;
  hotspot: {
    xPercent: number;
    yPercent: number;
    productId: string;
  };
}

const POSTER_SLIDES: PosterSlide[] = [
  {
    id: "poster-1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80",
    alt: "Spring Summer Campaign Poster",
    hotspot: {
      xPercent: 48,
      yPercent: 42,
      productId: "1",
    },
  },
  {
    id: "poster-2",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80",
    alt: "Minimalist Tailored Outfit Poster",
    hotspot: {
      xPercent: 52,
      yPercent: 38,
      productId: "2",
    },
  },
  {
    id: "poster-3",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=80",
    alt: "Urban Streetwear Drop Poster",
    hotspot: {
      xPercent: 50,
      yPercent: 45,
      productId: "3",
    },
  },
  {
    id: "poster-4",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=80",
    alt: "High Fashion Editorial Poster",
    hotspot: {
      xPercent: 46,
      yPercent: 40,
      productId: "4",
    },
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHotspotOpen, setIsHotspotOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Prevent background page scrolling when hotspot popover is open
  useEffect(() => {
    if (isHotspotOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isHotspotOpen]);

  // Auto carousel slide transition every 6 seconds (unless hotspot is open)
  useEffect(() => {
    if (isHotspotOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % POSTER_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHotspotOpen]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % POSTER_SLIDES.length);
    setIsHotspotOpen(false);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + POSTER_SLIDES.length) % POSTER_SLIDES.length);
    setIsHotspotOpen(false);
  };

  const handleQuickAdd = (product: typeof PRODUCTS[0], size?: string) => {
    addToCart(product, 1, undefined, size);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
      setIsHotspotOpen(false);
    }, 1200);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#F2F0F1] select-none">
      {/* Invisible Click-Outside Backdrop (No blur, no dark background) */}
      {isHotspotOpen && (
        <div
          onClick={() => setIsHotspotOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      {/* Horizontal Full-Width Campaign Poster Container */}
      <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[650px] overflow-hidden">
        {POSTER_SLIDES.map((slideItem, index) => {
          const isActive = currentSlide === index;
          const targetProduct = PRODUCTS.find((p) => p.id === slideItem.hotspot.productId) || PRODUCTS[0];

          return (
            <div
              key={slideItem.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Poster Image */}
              <Image
                src={slideItem.image}
                alt={slideItem.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center w-full h-full"
              />

              {/* Gradient Depth Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Single Interactive Product "+" Hotspot Icon */}
              <div
                className="absolute z-30"
                style={{ left: `${slideItem.hotspot.xPercent}%`, top: `${slideItem.hotspot.yPercent}%` }}
              >
                {/* Glowing Pulse Ring & "+" Button */}
                <button
                  onClick={() => setIsHotspotOpen((prev) => !prev)}
                  className="relative group flex items-center justify-center p-2 cursor-pointer"
                  aria-label={`View product details for ${targetProduct.title}`}
                >
                  <span className="absolute w-9 h-9 rounded-full bg-white/40 animate-ping pointer-events-none" />
                  <span className="relative w-9 h-9 rounded-full bg-black text-white border-2 border-white flex items-center justify-center font-black text-lg shadow-2xl transition-transform transform group-hover:scale-110">
                    +
                  </span>
                </button>

                {/* Normal Inline Interactive Product Popover Card */}
                <AnimatePresence>
                  {isActive && isHotspotOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-12 -left-28 sm:-left-32 w-60 sm:w-64 bg-white text-black rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-gray-100 z-50 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex gap-2.5 items-center mb-2.5">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                          <Image
                            src={targetProduct.image}
                            alt={targetProduct.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">
                            Featured Garment
                          </span>
                          <h4 className="text-xs font-bold text-black truncate">
                            {targetProduct.title}
                          </h4>
                          <p className="text-xs sm:text-sm font-black text-black mt-0.5">
                            ${targetProduct.price}
                          </p>
                        </div>
                      </div>

                      {/* Quick Size Swatches (Short Codes S M L XL) */}
                      {targetProduct.sizes && targetProduct.sizes.length > 0 && (
                        <div className="space-y-1 mb-2.5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                            Select Size:
                          </span>
                          <div className="flex items-center gap-1">
                            {targetProduct.sizes.slice(0, 4).map((sz) => (
                              <button
                                key={sz}
                                onClick={() => handleQuickAdd(targetProduct, sz)}
                                className="flex-1 py-1 rounded-md bg-gray-100 hover:bg-black hover:text-white text-black text-[11px] font-bold transition-colors"
                              >
                                {formatShortSize(sz)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-0.5">
                        <button
                          onClick={() => handleQuickAdd(targetProduct)}
                          className="flex-1 py-1.5 rounded-xl bg-black text-white font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-neutral-800 transition-colors shadow-md"
                        >
                          {addedProductId === targetProduct.id ? (
                            <>
                              <Check className="w-3 h-3" /> Added!
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3 h-3" /> Quick Add
                            </>
                          )}
                        </button>

                        <Link
                          href={`/product/${targetProduct.id}`}
                          className="px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black flex items-center justify-center transition-colors"
                          title="View Product Page"
                          onClick={() => setIsHotspotOpen(false)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Carousel Slide Left / Right Navigation Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 text-black backdrop-blur-md hover:bg-black hover:text-white transition-all shadow-xl cursor-pointer"
          aria-label="Previous Slide Poster"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 text-black backdrop-blur-md hover:bg-black hover:text-white transition-all shadow-xl cursor-pointer"
          aria-label="Next Slide Poster"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Slide Progress Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {POSTER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                setIsHotspotOpen(false);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
