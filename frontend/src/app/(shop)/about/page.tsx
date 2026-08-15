"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Truck,
  Sparkles,
  HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 text-black">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-integral text-3xl sm:text-5xl font-black uppercase text-black">
          ABOUT AIRAVÉ
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          We craft fashion that speaks your style. At AIRAVÉ, we believe
          everyone deserves high-quality, comfortable, and trendy clothes
          tailored for everyday confidence.
        </p>
      </div>

      {/* Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-[#F0F0F0] rounded-3xl p-8 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-black">Premium Fabrics</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            100% organic cotton, durable stitching, and ultra-breathable
            materials engineered for long-lasting wear.
          </p>
        </div>

        <div className="bg-[#F0F0F0] rounded-3xl p-8 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-black">Versatile Styles</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            From Casual, Formal, Party to Gym, our apparel fits seamless into
            every aspect of your life.
          </p>
        </div>

        <div className="bg-[#F0F0F0] rounded-3xl p-8 space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-black">Worldwide Shipping</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Fast 3-5 business days shipping with 256-bit SSL encrypted checkout
            and 30-day hassle-free returns.
          </p>
        </div>
      </div>

      {/* Company Works & Mission */}
      <div
        id="works"
        className="bg-black text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            OUR MISSION
          </span>
          <h2 className="font-integral text-2xl sm:text-3xl font-black">
            REDISCOVER YOUR EVERYDAY STYLE
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Founded in 2000, AIRAVÉ has grown into a global fashion brand
            serving over 30,000+ satisfied customers worldwide. We partner with
            ethical factories to create eco-friendly apparel without
            compromising on design.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 rounded-2xl p-6">
            <span className="font-integral text-3xl font-black text-white block">
              200+
            </span>
            <span className="text-xs text-gray-300">International Brands</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-6">
            <span className="font-integral text-3xl font-black text-white block">
              2,000+
            </span>
            <span className="text-xs text-gray-300">High Quality Products</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-6">
            <span className="font-integral text-3xl font-black text-white block">
              30,000+
            </span>
            <span className="text-xs text-gray-300">Happy Customers</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-6">
            <span className="font-integral text-3xl font-black text-white block">
              4.8 / 5
            </span>
            <span className="text-xs text-gray-300">Average Rating</span>
          </div>
        </div>
      </div>

      {/* Careers Section */}
      <div
        id="career"
        className="bg-[#F0F0F0] rounded-3xl p-8 sm:p-12 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-integral text-xl sm:text-2xl font-black text-black">
              JOIN OUR TEAM
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              We are always looking for passionate fashion designers,
              developers, and marketers.
            </p>
          </div>
          <button
            onClick={() =>
              alert("Applications submitted! We will get in touch soon.")
            }
            className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-full transition-all shrink-0"
          >
            Explore Openings
          </button>
        </div>
      </div>
    </div>
  );
}
