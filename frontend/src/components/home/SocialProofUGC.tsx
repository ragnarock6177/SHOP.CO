"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Heart, Camera } from "lucide-react";
import { PRODUCTS } from "@/data/mockData";
import { useCart } from "@/context/CartContext";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const UGC_POSTS = [
  {
    id: "ugc-1",
    handle: "@sophia_fashion",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    likes: "2.4k",
    taggedProductId: "1",
  },
  {
    id: "ugc-2",
    handle: "@marcus_fit",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    likes: "1.8k",
    taggedProductId: "2",
  },
  {
    id: "ugc-3",
    handle: "@elena_streetstyle",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    likes: "3.1k",
    taggedProductId: "3",
  },
  {
    id: "ugc-4",
    handle: "@david_vibes",
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=800&q=80",
    likes: "4.2k",
    taggedProductId: "4",
  },
];

export const SocialProofUGC: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<(typeof UGC_POSTS)[0] | null>(null);
  const { addToCart } = useCart();

  const activeProduct = selectedPost
    ? PRODUCTS.find((p) => p.id === selectedPost.taggedProductId) || PRODUCTS[0]
    : null;

  return (
    <section className="w-full bg-[#F9F9F9] py-14 px-4 sm:px-10 lg:px-16 overflow-hidden my-6 border-y border-gray-200/60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-bold text-xs mb-3 border border-rose-200">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>COMMUNITY LOOKBOOK</span>
          </div>
          <h2 className="font-be-vietnam-pro-black text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-black">
            #AIRAVESTYLE ON INSTAGRAM
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Tag @airave_official on Instagram or TikTok for a chance to be featured on our homepage.
          </p>
        </div>

        {/* 4-Column UGC Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {UGC_POSTS.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="relative aspect-3/4 rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gray-100"
            >
              <Image
                src={post.image}
                alt={`Outfit by ${post.handle}`}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover Dark Overlay & Handle Badge */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-between text-white z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                    <InstagramIcon className="w-3.5 h-3.5" />
                    {post.handle}
                  </span>
                  <span className="text-xs font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    {post.likes}
                  </span>
                </div>

                <button className="w-full py-2.5 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg">
                  <ShoppingBag className="w-3.5 h-3.5" /> Shop This Outfit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UGC Outfit Lightbox Modal */}
      <AnimatePresence>
        {selectedPost && activeProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2"
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: UGC Image */}
              <div className="relative aspect-4/5 md:aspect-auto bg-gray-100 min-h-[300px]">
                <Image
                  src={selectedPost.image}
                  alt={selectedPost.handle}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <InstagramIcon className="w-3.5 h-3.5" /> {selectedPost.handle}
                </div>
              </div>

              {/* Right Column: Tagged Product Details */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest block mb-2">
                    Tagged Garment In Photo
                  </span>
                  <h3 className="font-be-vietnam-pro-black text-2xl font-black uppercase text-black mb-2">
                    {activeProduct.title}
                  </h3>
                  <p className="text-sm font-black text-black text-2xl mb-4">
                    ${activeProduct.price}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed font-be-vietnam-pro">
                    {activeProduct.description ||
                      "Modern silhouette designed for versatile daily wear. Premium stitching and ultimate fit."}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      addToCart(activeProduct);
                      setSelectedPost(null);
                    }}
                    className="w-full h-12 rounded-full bg-black text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add Outfit Garment to Cart
                  </button>

                  <Link
                    href={`/product/${activeProduct.id}`}
                    onClick={() => setSelectedPost(null)}
                    className="block text-center text-xs font-bold text-black uppercase hover:underline py-1"
                  >
                    View Full Product Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SocialProofUGC;
