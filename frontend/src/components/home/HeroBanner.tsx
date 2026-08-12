'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkle } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <section className="bg-[#F2F0F1] relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-4 sm:my-6">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Headline, Description, Button, Stats */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-black z-10">
          
          <h1 className="font-integral text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
            FIND CLOTHES THAT MATCHES YOUR STYLE
          </h1>

          <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
            Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
          </p>

          <div>
            <Link
              href="/shop"
              className="inline-block w-full sm:w-auto text-center bg-black hover:bg-gray-800 text-white font-medium text-base px-12 py-4 rounded-full transition-all shadow-md hover:scale-105 active:scale-95"
            >
              Shop Now
            </Link>
          </div>

          {/* Stats Counter Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 sm:pt-6 border-t border-gray-200/80">
            <div>
              <h3 className="font-integral text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
                200+
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                International Brands
              </p>
            </div>

            <div className="border-l border-gray-300 pl-4 sm:pl-6">
              <h3 className="font-integral text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
                2,000+
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                High-Quality Products
              </p>
            </div>

            <div className="border-l border-gray-300 pl-4 sm:pl-6">
              <h3 className="font-integral text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
                30,000+
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Happy Customers
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image Showcase with Decorative Star Sparkles */}
        <div className="lg:col-span-5 relative flex justify-center items-end min-h-95 sm:min-h-115">
          
          {/* Top Right Decorative Sparkle */}
          <div className="absolute top-4 right-2 sm:right-6 z-20 text-black">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M28 0C28 15.464 40.536 28 56 28C40.536 28 28 40.536 28 56C28 40.536 15.464 28 0 28C15.464 28 28 15.464 28 0Z" />
            </svg>
          </div>

          {/* Left Middle Decorative Sparkle */}
          <div className="absolute top-1/2 left-2 z-20 text-black">
            <svg width="36" height="36" viewBox="0 0 56 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M28 0C28 15.464 40.536 28 56 28C40.536 28 28 40.536 28 56C28 40.536 15.464 28 0 28C15.464 28 28 15.464 28 0Z" />
            </svg>
          </div>

          {/* Hero Couple Image */}
          <div className="relative w-full h-100 sm:h-120">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
              alt="Fashion Couple Showcase"
              fill
              priority
              className="object-cover object-top rounded-2xl"
            />
          </div>
        </div>

      </div>
    </section>
  );
};
