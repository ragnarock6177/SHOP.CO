"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatShortSize } from "@/components/product/ProductCard";
import { StorefrontBanner } from "@/types/settings";
import { getStorefrontSettingsApi } from "@/lib/settingsApi";

interface HeroBannerProps {
  banners?: StorefrontBanner[];
}

const FALLBACK_SLIDES = [
  {
    id: "poster-1",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80",
    alt: "Spring Summer Campaign Poster",
    title: "SPRING SUMMER CAMPAIGN",
    buttonUrl: "/product",
    hotspotProduct: {
      id: "1",
      name: "ONE LIFE GRAPHIC T-SHIRT",
      slug: "one-life-graphic-t-shirt",
      price: 260,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80",
      sizes: ["S", "M", "L", "XL"],
    },
  },
  {
    id: "poster-2",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1800&q=80",
    alt: "Minimalist Tailored Outfit Poster",
    title: "MINIMALIST TAILORED OUTFIT",
    buttonUrl: "/product",
    hotspotProduct: {
      id: "2",
      name: "OVERSIZED TAILORED BLAZER",
      slug: "oversized-tailored-blazer",
      price: 450,
      image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
      sizes: ["S", "M", "L", "XL"],
    },
  },
  {
    id: "poster-3",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1800&q=80",
    alt: "Urban Streetwear Drop Poster",
    title: "URBAN STREETWEAR DROP",
    buttonUrl: "/product",
    hotspotProduct: null, // Optional: No hotspot product linked for this slide
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ banners: initialBanners }) => {
  const [banners, setBanners] = useState<any[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : FALLBACK_SLIDES
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHotspotOpen, setIsHotspotOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // useState is already initialized with initialBanners — calling setBanners here
    // again is redundant and causes an extra re-render + image reload (blink).
    // Only fetch from the API when no banners were passed from the parent.
    if (initialBanners && initialBanners.length > 0) return;

    getStorefrontSettingsApi()
      .then((res) => {
        if (res?.home?.banners && res.home.banners.length > 0) {
          setBanners((prev) => {
            const prevIds = prev.map((b) => b.id).join(",");
            const nextIds = res.home.banners.map((b: any) => b.id).join(",");
            return prevIds === nextIds ? prev : res.home.banners;
          });
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

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
    if (isHotspotOpen || banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHotspotOpen, banners.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsHotspotOpen(false);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsHotspotOpen(false);
  };

  const handleQuickAdd = (product: any, size?: string) => {
    const normProd = {
      id: product.id,
      title: product.name || product.title,
      price: product.price,
      image: product.image,
      category: "Featured",
      rating: 5.0,
      description: "",
    };
    addToCart(normProd as any, 1, undefined, size);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId(null);
      setIsHotspotOpen(false);
    }, 1200);
  };

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-[#F2F0F1] select-none">
      {/* Invisible Click-Outside Backdrop */}
      {isHotspotOpen && (
        <div
          onClick={() => setIsHotspotOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      {/* Horizontal Full-Width Campaign Poster Container */}
      <div className="relative w-full h-120 sm:h-140 lg:h-162.5 overflow-hidden">
        {banners.map((slideItem, index) => {
          const isActive = currentSlide === index;
          const imageUrl = slideItem.desktopImageUrl || slideItem.image;
          const altText = slideItem.title || slideItem.alt || "Campaign Poster";
          const hotspotProduct = slideItem.hotspotProduct;

          return (
            <div
              key={slideItem.id || index}
              className={`absolute inset-0 w-full h-full bg-[#F2F0F1] transition-opacity duration-500 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Poster Image */}
              <Image
                src={imageUrl}
                alt={altText}
                fill
                priority={index === 0}
                // Explicit fetchPriority="high" fixes the Lighthouse LCP warning —
                // Next.js priority prop alone isn't enough inside client components
                // because the preload link is injected after hydration (too late).
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAKABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EACQQAAICAQQBBQAAAAAAAAAAAAECAxEEBSExBhJBUWH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8Aq9ZQhiNUEqkklJaJOxNnBJFHFHEikFrQ3R3jC5fDU4JKQT2sO66lVBk8ks39hZvN3OyuIbckpaeWEnuPfqP/2Q=="
                className="object-cover object-center w-full h-full"
              />

              {/* Gradient Depth Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

              {/* RENDER PLUS HOTSPOT PIN ONLY IF A PRODUCT IS LINKED TO THIS BANNER */}
              {hotspotProduct && (
                <div className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  {/* Glowing Pulse Ring & "+" Button */}
                  <button
                    onClick={() => setIsHotspotOpen((prev) => !prev)}
                    className="relative group flex items-center justify-center p-2 cursor-pointer"
                    aria-label={`View product details for ${hotspotProduct.name || hotspotProduct.title}`}
                  >
                    <span className="absolute w-9 h-9 rounded-full bg-white/40 animate-ping pointer-events-none" />
                    <span className="relative w-9 h-9 rounded-full bg-black text-white border-2 border-white flex items-center justify-center font-black text-lg shadow-2xl transition-transform transform group-hover:scale-110">
                      +
                    </span>
                  </button>

                  {/* Normal Inline Interactive Product Popover Card */}
                  <AnimatePresence>
                    {isActive && isHotspotOpen && (
                      <LazyMotion features={domAnimation}>
                        <m.div
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
                              src={hotspotProduct.image}
                              alt={hotspotProduct.name || "Featured Garment"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest block">
                              FEATURED GARMENT
                            </span>
                            <h4 className="text-xs font-bold text-black truncate uppercase">
                              {hotspotProduct.name || hotspotProduct.title}
                            </h4>
                            <p className="text-xs sm:text-sm font-black text-black mt-0.5">
                              ${hotspotProduct.price}
                            </p>
                          </div>
                        </div>

                        {/* Quick Size Swatches (Short Codes S M L XL) */}
                        {hotspotProduct.sizes && hotspotProduct.sizes.length > 0 && (
                          <div className="space-y-1 mb-2.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                              SELECT SIZE:
                            </span>
                            <div className="flex items-center gap-1">
                              {hotspotProduct.sizes.slice(0, 4).map((sz: string) => (
                                <button
                                  key={sz}
                                  onClick={() => handleQuickAdd(hotspotProduct, sz)}
                                  className="flex-1 py-1 rounded-md bg-gray-100 hover:bg-black hover:text-white text-black text-[11px] font-bold transition-colors cursor-pointer"
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
                            onClick={() => handleQuickAdd(hotspotProduct)}
                            className="flex-1 py-1.5 rounded-xl bg-black text-white font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-neutral-800 transition-colors shadow-md cursor-pointer"
                          >
                            {addedProductId === hotspotProduct.id ? (
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
                            href={`/product/${hotspotProduct.slug || hotspotProduct.id}`}
                            className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black flex items-center justify-center transition-colors cursor-pointer"
                            title="View Product Page"
                            onClick={() => setIsHotspotOpen(false)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        </m.div>
                      </LazyMotion>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}

        {/* Carousel Slide Left / Right Navigation Controls */}
        {banners.length > 1 && (
          <>
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
              {banners.map((_, idx) => (
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
          </>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
