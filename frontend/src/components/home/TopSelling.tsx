"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf } from "lucide-react";
import { motion, Variants } from "framer-motion";

const TOP_SELLING = [
  {
    id: 1,
    name: "Vertical Striped Shirt",
    image: "/img1.png",
    rating: 5.0,
    price: 212,
    originalPrice: 232,
    discount: "-20%",
  },
  {
    id: 2,
    name: "Courage Graphic T-shirt",
    image: "/img2.png",
    rating: 4.0,
    price: 145,
    originalPrice: null,
    discount: null,
  },
  {
    id: 3,
    name: "Loose Fit Bermuda Shorts",
    image: "/img3.png",
    rating: 3.0,
    price: 80,
    originalPrice: null,
    discount: null,
  },
  {
    id: 4,
    name: "Faded Skinny Jeans",
    image: "/img4.png",
    rating: 4.5,
    price: 210,
    originalPrice: null,
    discount: null,
  },
];

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1 my-2">
      <div className="flex items-center text-[#FFC633]">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />
        ))}
        {hasHalf && (
          <StarHalf className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />
        )}
      </div>
      <span className="font-satoshi text-xs sm:text-sm text-black/70 font-normal ml-1">
        {rating.toFixed(1)}/<span className="text-black/40">5</span>
      </span>
    </div>
  );
}

// Stagger Parent Container Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12, // Har card ek ke baad ek 0.12s gap me aayega
    },
  },
};

// Item Animation Variants (Slide up without blur)
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function TopSelling() {
  return (
    <section className="w-full bg-white py-2 sm:py-5 lg:py-5 px-4 sm:px-10 max-w-[1440px] mx-auto overflow-hidden">
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="font-integral text-[32px] sm:text-[40px] lg:text-[48px] font-bold sm:font-extrabold text-black text-center uppercase tracking-normal sm:tracking-tight leading-none mb-8 sm:mb-14"
      >
        TOP SELLING
      </motion.h2>

      {/* Product Cards Grid with Sequential Stagger Animation */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
      >
        {TOP_SELLING.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col group cursor-pointer"
          >
            {/* Image Container */}
            <div className="w-full bg-[#F0EEED] rounded-[20px] aspect-square flex items-center justify-center p-4 overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                priority
                className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Product Details */}
            <h3 className="font-satoshi font-bold text-base sm:text-lg text-black mt-3 sm:mt-4 truncate">
              {product.name}
            </h3>

            {/* Rating Stars */}
            <RatingStars rating={product.rating} />

            {/* Price Row */}
            <div className="flex items-center gap-2.5 mt-1">
              <span className="font-satoshi font-bold text-xl sm:text-2xl text-black">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="font-satoshi font-bold text-xl sm:text-2xl text-black/40 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-[#FF3333]/10 text-[#FF3333] font-satoshi text-xs font-medium px-3 py-1 rounded-full">
                  {product.discount}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-center mt-9 sm:mt-12"
      >
        <Link
          href="/shop"
          className="w-full sm:w-54.5 h-13 bg-white border border-black/10 rounded-full font-satoshi font-medium text-black hover:text-white text-base cursor-pointer relative overflow-hidden transition-all duration-500 ease-in-out shadow-sm hover:shadow-md z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-black before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 flex items-center justify-center"
        >
          View All
        </Link>
      </motion.div>
    </section>
  );
}

export default TopSelling;
