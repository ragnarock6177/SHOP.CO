'use client';

import React, { useState } from 'react';
import { Star, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { REVIEWS } from '../../data/mockData';

export const CustomerReviews: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16 space-y-8">
      
      {/* Header with Title and Navigation Arrows */}
      <div className="flex items-end justify-between">
        <h2 className="font-integral text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight">
          OUR HAPPY CUSTOMERS
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="p-2.5 rounded-full border border-gray-200 text-black hover:bg-black hover:text-white transition-colors"
            aria-label="Previous Review"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2.5 rounded-full border border-gray-200 text-black hover:bg-black hover:text-white transition-colors"
            aria-label="Next Review"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((review, idx) => (
          <div
            key={review.id}
            className="border border-gray-200/80 rounded-2xl p-6 sm:p-7 bg-white space-y-3 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 5 Yellow Stars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FFC633] text-[#FFC633]" />
              ))}
            </div>

            {/* Customer Name & Verified Badge */}
            <div className="flex items-center gap-2 pt-1">
              <h4 className="font-bold text-lg text-black">
                {review.userName}
              </h4>
              {review.verified && (
                <span className="w-5 h-5 rounded-full bg-[#01AB31] text-white flex items-center justify-center text-[10px]" title="Verified Buyer">
                  <Check className="w-3 h-3 stroke-3" />
                </span>
              )}
            </div>

            {/* Review Comment Text */}
            <p className="text-gray-600 text-sm leading-relaxed">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>

    </section>
  );
};
