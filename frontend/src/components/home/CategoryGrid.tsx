"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const DRESS_STYLES = [
  {
    id: 1,
    title: "Casual",
    itemCount: "180+ Items",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80",
    href: "/product?category=casual",
    colSpan: "lg:col-span-4",
    imgClass: "object-cover object-right-top",
  },
  {
    id: 2,
    title: "Formal",
    itemCount: "120+ Items",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    href: "/product?category=formal",
    colSpan: "lg:col-span-8",
    imgClass: "object-cover object-right-top",
  },
  {
    id: 3,
    title: "Party",
    itemCount: "95+ Items",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    href: "/product?category=party",
    colSpan: "lg:col-span-8",
    imgClass: "object-cover object-center",
  },
  {
    id: 4,
    title: "Gym",
    itemCount: "140+ Items",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
    href: "/product?category=gym",
    colSpan: "lg:col-span-4",
    imgClass: "object-cover object-right-top",
  },
];

export function CategoryGrid() {
  return (
    <section className="w-full bg-[#F0F0F0] py-12 lg:py-20 px-4 sm:px-10 lg:px-16 overflow-hidden my-8">
      <div className="max-w-7xl mx-auto flex flex-col justify-center">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-14">
          <span className="text-xs font-extrabold tracking-widest text-black/50 uppercase block mb-2 font-be-vietnam-pro">
            CURATED LOOKS FOR EVERY OCCASION
          </span>
          <h2 className="font-be-vietnam-pro-black text-[28px] sm:text-[40px] lg:text-[48px] font-black text-black uppercase tracking-tight leading-none">
            BROWSE BY DRESS STYLE
          </h2>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {DRESS_STYLES.map((style) => (
            <div key={style.id} className={`block ${style.colSpan}`}>
              <Link href={style.href} className="block w-full group">
                <div className="relative bg-white rounded-3xl h-52 lg:h-76 overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  {/* Category Header Inside Card */}
                  <div className="absolute top-5 left-6 lg:top-8 lg:left-8 z-20 space-y-1">
                    <h3 className="font-be-vietnam-pro-black font-black text-2xl sm:text-3xl lg:text-4xl text-black uppercase tracking-tight">
                      {style.title}
                    </h3>
                    <span className="inline-block bg-black/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-black/80">
                      {style.itemCount}
                    </span>
                  </div>

                  {/* Top Right Arrow Indicator on Hover */}
                  <div className="absolute top-5 right-6 z-20 p-3 rounded-full bg-white/80 backdrop-blur-md text-black opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-md">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 z-10 bg-linear-to-t from-black/25 via-transparent to-white/40 pointer-events-none group-hover:opacity-60 transition-opacity duration-300" />

                  {/* Background Image */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                      src={style.image}
                      alt={`${style.title} Style`}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      loading="lazy"
                      className={`w-full h-full ${style.imgClass} group-hover:scale-108 transition-transform duration-700 ease-out`}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
