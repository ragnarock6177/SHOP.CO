"use client";

import React from "react";
import { Star, Check } from "lucide-react";
import { REVIEWS } from "../../data/mockData";

// Duplicate reviews to create a seamless infinite marquee train scroll
const MARQUEE_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

export const CustomerReviews: React.FC = () => {
  return (
    <section className="w-full my-10 sm:my-16 space-y-6 sm:space-y-8 overflow-hidden">
      {/* Header with Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <span className="text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-1 font-be-vietnam-pro">
            VERIFIED CUSTOMER TESTIMONIALS
          </span>
          <h2 className="font-be-vietnam-pro-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase tracking-tight leading-tight">
            OUR HAPPY CUSTOMERS
          </h2>
        </div>
      </div>

      {/* Full-Width Edge-to-Edge Continuous Pure CSS GPU Marquee Track */}
      <div className="relative w-full overflow-hidden py-2 sm:py-4 gpu-layer select-none">
        {/* Soft edge fade overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 lg:w-48 bg-linear-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 lg:w-48 bg-linear-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Pure CSS Hardware-Accelerated Train Animation Track */}
        <div className="animate-marquee flex gap-3.5 sm:gap-5 lg:gap-6 items-center">
          {MARQUEE_REVIEWS.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="w-[280px] xs:w-[320px] sm:w-[380px] lg:w-[400px] min-h-[190px] sm:min-h-[220px] flex-none border border-gray-200/90 rounded-2xl p-4.5 sm:p-6 lg:p-7 bg-white flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-1.5 hover:border-gray-300 transition-all duration-300 cursor-default select-none shrink-0"
            >
              <div className="space-y-2.5 sm:space-y-3">
                {/* 5 Monochrome Solid Black Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-black text-black"
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
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] sm:text-[10px] shrink-0"
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
