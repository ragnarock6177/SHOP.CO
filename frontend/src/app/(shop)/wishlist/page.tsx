'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { PRODUCTS } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, clearWishlist, addToCart, wishlistCount } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter products that are in the wishlist
  const wishedProducts = PRODUCTS.filter((product) => wishlist.includes(product.id));

  // Recommended products (products not in wishlist)
  const recommendedProducts = PRODUCTS.filter((product) => !wishlist.includes(product.id)).slice(0, 4);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleMoveToCart = (product: (typeof PRODUCTS)[0]) => {
    addToCart(product);
    showToast(`Added "${product.title}" to your cart!`);
  };

  const handleAddAllToCart = () => {
    if (wishedProducts.length === 0) return;
    wishedProducts.forEach((product) => addToCart(product));
    showToast(`Added all ${wishedProducts.length} items to your cart!`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-[#FFC633] text-[#FFC633]" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 sm:right-8 z-50 bg-black text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-be-vietnam-pro">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-black font-semibold">Wishlist</span>
      </nav>

      {/* Wishlist Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-be-vietnam-pro-black text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">
              YOUR WISHLIST
            </h1>
            <span className="bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm px-3 py-1 rounded-full">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-be-vietnam-pro">
            Keep track of items you love and add them to your cart anytime.
          </p>
        </div>

        {/* Top Header Action Controls */}
        {wishedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-full transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your wishlist?')) {
                  clearWishlist();
                  showToast('Wishlist cleared');
                }
              }}
              className="flex items-center gap-1.5 bg-[#F0F0F0] hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold text-xs sm:text-sm px-4 py-3 rounded-full transition-all"
              title="Clear all saved items"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Wishlist</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Wishlist Content */}
      {wishedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {wishedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col justify-between bg-white border border-gray-100 rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Remove Wishlist Button */}
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    showToast(`Removed "${product.title}" from wishlist`);
                  }}
                  className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md"
                  title="Remove from Wishlist"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>

                {/* Product Image Preview */}
                <div className="relative aspect-square w-full bg-[#F0EEED] rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.discount && (
                    <span className="absolute top-3 left-3 bg-[#FF3333] text-white font-bold text-[10px] rounded-full px-2.5 py-1 uppercase tracking-wider">
                      -{product.discount}% OFF
                    </span>
                  )}
                </div>

                {/* Product Meta */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-be-vietnam-pro font-bold text-base text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-400 capitalize pt-0.5">
                      {product.category}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 pt-1 text-xs">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                      <span className="font-medium text-black">{product.rating}</span>
                    </div>
                  </div>

                  {/* Pricing Row & Action */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 font-be-vietnam-pro">
                      <span className="font-extrabold text-xl text-black">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="font-bold text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#F9F9F9] border border-dashed border-gray-300 rounded-3xl p-10 sm:p-16 text-center space-y-6 max-w-2xl mx-auto my-8"
        >
          <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-10 h-10 fill-rose-500/20" />
          </div>

          <div className="space-y-2">
            <h2 className="font-be-vietnam-pro-black text-xl sm:text-2xl font-black text-black uppercase">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Explore our latest catalog and tap the heart icon on items you like to save them for later.
            </p>
          </div>

          <div>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold text-sm px-8 py-4 rounded-full transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="pt-12 border-t border-gray-200 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-be-vietnam-pro-black text-xl sm:text-2xl font-black text-black uppercase">
                YOU MIGHT ALSO LIKE
              </h2>
            </div>
            <Link
              href="/product"
              className="text-xs sm:text-sm font-bold text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
