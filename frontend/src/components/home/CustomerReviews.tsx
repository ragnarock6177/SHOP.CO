"use client";

import React, { useEffect, useRef } from "react";
import { Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { REVIEWS } from "../../data/mockData";

// Duplicate reviews to create a seamless infinite train scroll
const MARQUEE_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

export const CustomerReviews: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: 55,
        repeat: -1,
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full my-10 sm:my-16 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Header with Title (Kept within 7xl container for alignment) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <h2 className="font-be-vietnam-pro-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            OUR HAPPY CUSTOMERS
          </h2>
        </motion.div>
      </div>

      {/* Full-Width Edge-to-Edge Continuous Train Marquee Track */}
      <div
        className="relative w-full overflow-hidden py-2 sm:py-4"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.play()}
        onTouchStart={() => tweenRef.current?.pause()}
        onTouchEnd={() => tweenRef.current?.play()}
      >
        {/* Soft edge fade overlays (Responsive Width) */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 lg:w-48 bg-linear-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 lg:w-48 bg-linear-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* GSAP Train Animation Track */}
        <div
          ref={trackRef}
          className="flex gap-3.5 sm:gap-5 lg:gap-6 w-max will-change-transform cursor-pointer"
        >
          {MARQUEE_REVIEWS.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="w-[280px] xs:w-[320px] sm:w-[380px] lg:w-[400px] min-h-[190px] sm:min-h-[220px] flex-none border border-gray-200/90 rounded-2xl p-4.5 sm:p-6 lg:p-7 bg-white flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1.5 hover:border-gray-300 transition-all duration-300 cursor-default select-none"
            >
              <div className="space-y-2.5 sm:space-y-3">
                {/* 5 Yellow Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-[#FFC633] text-[#FFC633]"
                    />
                  ))}
                </div>

                {/* Customer Name & Verified Badge */}
                <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
                  <h3 className="font-be-vietnam-pro font-bold text-base sm:text-lg text-black">
                    {review.userName}
                  </h3>
                  {review.verified && (
                    <span
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#01AB31] text-white flex items-center justify-center text-[9px] sm:text-[10px] shrink-0"
                      title="Verified Buyer"
                    >
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-3" />
                    </span>
                  )}
                </div>

                {/* Review Comment Text */}
                <p className="font-be-vietnam-pro text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-4 sm:line-clamp-none">
                  "{review.comment}"
                </p>
              </div>

              {/* Review Date */}
              {review.date && (
                <p className="font-be-vietnam-pro text-[11px] sm:text-xs text-gray-400 font-medium pt-3 sm:pt-4 border-t border-gray-100 mt-3 sm:mt-4">
                  {review.date}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
