"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, StarHalf } from "lucide-react";
import { getProductsApi } from "@/lib/productApi";
import { Product } from "@/types/ecommerce";

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
      <span className="font-be-vietnam-pro text-xs sm:text-sm text-black/70 font-normal ml-1">
        {rating.toFixed(1)}/<span className="text-black/40">5</span>
      </span>
    </div>
  );
}

export function TopSelling() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProductsApi({ limit: 4 })
      .then(({ products }) => {
        if (products.length > 0) setProducts(products.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full bg-white py-2 sm:py-5 lg:py-5 px-4 sm:px-10 max-w-[1440px] mx-auto overflow-hidden">
      {/* Section Title */}
      <h2 className="font-be-vietnam-pro-black text-[32px] sm:text-[40px] lg:text-[48px] font-bold sm:font-extrabold text-black text-center uppercase tracking-normal sm:tracking-tight leading-none mb-8 sm:mb-14">
        TOP SELLING
      </h2>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex flex-col group cursor-pointer hover:-translate-y-1.5 transition-transform duration-200"
          >
            {/* Image Container */}
            <div className="w-full bg-[#F0EEED] rounded-[20px] aspect-square flex items-center justify-center p-4 overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                className="object-cover w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Product Details */}
            <h3 className="font-be-vietnam-pro font-bold text-base sm:text-lg text-black mt-3 sm:mt-4 truncate">
              {product.title}
            </h3>

            {/* Rating Stars */}
            <RatingStars rating={product.rating} />

            {/* Price Row */}
            <div className="flex items-center gap-2.5 mt-1">
              <span className="font-be-vietnam-pro font-bold text-xl sm:text-2xl text-black">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="font-be-vietnam-pro font-bold text-xl sm:text-2xl text-black/40 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.discount && (
                <span className="bg-[#FF3333]/10 text-[#FF3333] font-be-vietnam-pro text-xs font-medium px-3 py-1 rounded-full">
                  -{product.discount}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      <div className="w-full flex justify-center mt-9 sm:mt-12">
        <Link
          href="/product"
          className="w-full sm:w-54.5 h-13 bg-white border border-black/10 rounded-full font-be-vietnam-pro font-medium text-black hover:text-white text-base cursor-pointer relative overflow-hidden transition-all duration-500 ease-in-out shadow-sm hover:shadow-md z-10 before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-black before:transition-all before:duration-500 before:ease-in-out before:z-[-1] before:rounded-full hover:before:left-0 flex items-center justify-center"
        >
          View All
        </Link>
      </div>
    </section>
  );
}

export default TopSelling;
