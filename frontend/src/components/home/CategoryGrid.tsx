"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const DRESS_STYLES = [
  {
    id: 1,
    title: "Casual",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80",
    href: "/shop?category=casual",
    colSpan: "lg:col-span-4",
    imgClass: "object-cover object-right-top",
  },
  {
    id: 2,
    title: "Formal",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    href: "/shop?category=formal",
    colSpan: "lg:col-span-8",
    imgClass: "object-cover object-right-top",
  },
  {
    id: 3,
    title: "Party",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    href: "/shop?category=party",
    colSpan: "lg:col-span-8",
    imgClass: "object-cover object-center",
  },
  {
    id: 4,
    title: "Gym",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
    href: "/shop?category=gym",
    colSpan: "lg:col-span-4",
    imgClass: "object-cover object-right-top",
  },
];

// Stagger Parent Container Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Ek ke baad ek cards 0.12s gap me aayenge
    },
  },
};

// Card Animation Variants (No blur, clean slide up)
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function CategoryGrid() {
  return (
    <section className="w-full bg-[#F0F0F0] py-12 lg:py-17.5 px-4 sm:px-10 lg:px-16 overflow-hidden">
      <div className="max-w-309.75 mx-auto flex flex-col justify-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-integral text-[28px] sm:text-[40px] lg:text-[48px] font-bold sm:font-extrabold text-black text-center uppercase tracking-tight leading-none mb-8 lg:mb-16"
        >
          BROWSE BY DRESS STYLE
        </motion.h2>

        {/* Grid Container with Staggered Landing */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
        >
          {DRESS_STYLES.map((style) => (
            <motion.div
              key={style.id}
              variants={cardVariants}
              className={`block ${style.colSpan}`}
            >
              <Link href={style.href} className="block w-full">
                <motion.div
                  whileHover={{ scale: 1.015, y: -2 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative bg-white rounded-[20px] h-47.5 lg:h-72.25 overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Title inside card */}
                  <h3 className="font-satoshi font-bold text-2xl sm:text-3xl lg:text-[36px] text-black absolute top-5 left-6 lg:top-9 lg:left-9 z-20">
                    {style.title}
                  </h3>

                  {/* Light Premium Shade Overlay */}
                  <div className="absolute inset-0 z-10 bg-linear-to-t from-black/15 via-transparent to-white/30 pointer-events-none group-hover:opacity-75 transition-opacity duration-300" />

                  {/* Image Container */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                      src={style.image}
                      alt={`${style.title} Style`}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      priority
                      className={`w-full h-full ${style.imgClass} group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CategoryGrid;
