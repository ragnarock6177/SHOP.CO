"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { useCart } from "@/context/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
      }
      setQuantity(1);
      setAddedAnimation(false);
    }
  }, [product]);

  if (!product) return null;

  const isWished = isInWishlist(product.id);
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-gray-100 hover:bg-black hover:text-white transition-colors duration-200 text-gray-600"
              aria-label="Close Quick View"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
              {/* Left Column: Image Gallery */}
              <div className="p-6 bg-[#F8F8F8] flex flex-col justify-between items-center relative">
                {/* Wishlist Button Overlay */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`absolute top-6 left-6 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all z-10 ${
                    isWished
                      ? "bg-black text-white"
                      : "bg-white/90 text-gray-700 hover:bg-black hover:text-white"
                  }`}
                  title={isWished ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWished ? "fill-current" : ""}`} />
                </button>

                {/* Main Large Image */}
                <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden mb-4 bg-white border border-gray-200/60 shadow-xs">
                  <Image
                    src={selectedImage || product.image}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Thumbnail Strips */}
                {gallery.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 scrollbar-none justify-center">
                    {gallery.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          selectedImage === imgUrl ? "border-black scale-105 shadow-sm" : "border-gray-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Product Details & Purchase Form */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div>
                  {/* Category Tag */}
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    {product.category}
                  </span>

                  {/* Product Title */}
                  <h2 className="font-be-vietnam-pro-black text-2xl md:text-3xl font-black text-black leading-tight uppercase mb-2">
                    {product.title}
                  </h2>

                  {/* Rating & Reviews (Monochrome Black Stars) */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center text-black">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "fill-black text-black"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-be-vietnam-pro text-sm font-bold text-black">
                      {product.rating}
                    </span>
                    <span className="text-gray-400 text-xs font-normal">
                      ({product.reviewsCount || 48} reviews)
                    </span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <span className="font-be-vietnam-pro font-black text-3xl text-black">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="font-be-vietnam-pro font-bold text-xl text-gray-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    {product.discount && (
                      <span className="bg-black text-white font-be-vietnam-pro text-xs font-bold px-3 py-1 rounded-full">
                        -{product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Short Description */}
                  <p className="text-gray-600 text-sm leading-relaxed my-4 font-be-vietnam-pro">
                    {product.description ||
                      "Crafted from premium heavyweight fabrics designed for modern aesthetic and long-lasting luxury fit."}
                  </p>

                  {/* Color Selector */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Select Color: <span className="text-black font-semibold">{selectedColor}</span>
                      </label>
                      <div className="flex items-center gap-2.5">
                        {product.colors.map((col) => (
                          <button
                            key={col.name}
                            onClick={() => setSelectedColor(col.name)}
                            style={{ backgroundColor: col.hex }}
                            className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                              selectedColor === col.name
                                ? "border-black scale-110 shadow-md ring-2 ring-black/20"
                                : "border-gray-200 hover:scale-105"
                            }`}
                            title={col.name}
                          >
                            {selectedColor === col.name && (
                              <Check
                                className={`w-4 h-4 ${
                                  col.hex.toLowerCase() === "#ffffff" || col.hex.toLowerCase() === "#fff"
                                    ? "text-black"
                                    : "text-white"
                                }`}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Select Size: <span className="text-black font-semibold">{selectedSize}</span>
                        </label>
                        <span className="text-xs font-medium text-black/60 underline cursor-pointer hover:text-black">
                          Size Guide
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSize(sz)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              selectedSize === sz
                                ? "bg-black text-white shadow-sm"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Counter */}
                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                      Quantity:
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 bg-gray-50">
                        <button
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 text-gray-600 hover:text-black font-bold text-lg"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-black">{quantity}</span>
                        <button
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-7 h-7 text-gray-600 hover:text-black font-bold text-lg"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-black" />
                        In Stock & Ready to Ship
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions & Guarantee */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 h-13 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
                        addedAnimation
                          ? "bg-neutral-800 scale-98"
                          : "bg-black hover:bg-neutral-800 active:scale-98"
                      }`}
                    >
                      {addedAnimation ? (
                        <>
                          <Check className="w-5 h-5 text-white" /> Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" /> Add to Cart — ${(product.price * quantity).toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    onClick={onClose}
                    className="block text-center text-xs font-bold text-black uppercase tracking-wider hover:underline py-1"
                  >
                    View Full Product Details →
                  </Link>

                  {/* Micro Trust Badges */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-[11px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-black shrink-0" />
                      <span>Free Express Shipping</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-black shrink-0" />
                      <span>30-Day Easy Returns</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                      <span>100% Original Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
