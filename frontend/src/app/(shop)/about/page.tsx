"use client";

import React from "react";
import {
  Award,
  Truck,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-12 text-black font-be-vietnam-pro gpu-layer">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="font-be-vietnam-pro-black text-2xl sm:text-5xl font-black uppercase text-black tracking-tight">
          ABOUT AIRAVÉ
        </h1>
        <p className="text-xs sm:text-base text-gray-600 leading-relaxed font-medium">
          We craft fashion that speaks your style. At AIRAVÉ, we believe
          everyone deserves high-quality, comfortable, and trendy clothes
          tailored for everyday confidence.
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-[#F4F4F4] rounded-3xl p-6 sm:p-8 space-y-2.5 text-center shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-black">Premium Fabrics</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            100% organic cotton, durable stitching, and ultra-breathable
            materials engineered for long-lasting wear.
          </p>
        </div>

        <div className="bg-[#F4F4F4] rounded-3xl p-6 sm:p-8 space-y-2.5 text-center shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-black">Versatile Styles</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            From Casual, Formal, Party to Gym, our apparel fits seamless into
            every aspect of your life.
          </p>
        </div>

        <div className="bg-[#F4F4F4] rounded-3xl p-6 sm:p-8 space-y-2.5 text-center shadow-2xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-2xs">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-black">Worldwide Shipping</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Fast 3-5 business days shipping with 256-bit SSL encrypted checkout
            and 30-day hassle-free returns.
          </p>
        </div>
      </div>

      {/* Company Works & Mission */}
      <div
        id="works"
        className="bg-black text-white rounded-3xl p-6 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center shadow-md"
      >
        <div className="space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
            OUR MISSION
          </span>
          <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black uppercase">
            REDISCOVER YOUR EVERYDAY STYLE
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
            Founded in 2000, AIRAVÉ has grown into a global fashion brand
            serving over 30,000+ satisfied customers worldwide. We partner with
            ethical factories to create eco-friendly apparel without
            compromising on design.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white/10 rounded-2xl p-4 sm:p-6">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-white block">
              200+
            </span>
            <span className="text-[11px] text-gray-300 font-medium">International Brands</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 sm:p-6">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-white block">
              2,000+
            </span>
            <span className="text-[11px] text-gray-300 font-medium">High Quality Products</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 sm:p-6">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-white block">
              30,000+
            </span>
            <span className="text-[11px] text-gray-300 font-medium">Happy Customers</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 sm:p-6">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-white block">
              4.8 / 5
            </span>
            <span className="text-[11px] text-gray-300 font-medium">Average Rating</span>
          </div>
        </div>
      </div>

      {/* Careers Section */}
      <div
        id="career"
        className="bg-[#F4F4F4] rounded-3xl p-6 sm:p-12 space-y-4 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black uppercase">
              JOIN OUR TEAM
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">
              We are always looking for passionate fashion designers,
              developers, and marketers.
            </p>
          </div>
          <button
            onClick={() =>
              alert("Applications submitted! We will get in touch soon.")
            }
            className="px-7 py-3 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase rounded-full transition-all shrink-0 cursor-pointer shadow-xs"
          >
            Explore Openings
          </button>
        </div>
      </div>
    </div>
  );
}
