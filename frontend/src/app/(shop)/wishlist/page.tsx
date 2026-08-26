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
  const recommendedProducts = PRODUCTS.filter((product) => !wishlist.includes(product.id)).slice(0, 6);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleMoveToCart = (product: (typeof PRODUCTS)[0]) => {
    addToCart(product);
    showToast(`Added "${product.title}" to cart!`);
  };

  const handleAddAllToCart = () => {
    if (wishedProducts.length === 0) return;
    wishedProducts.forEach((product) => addToCart(product));
    showToast(`Added all ${wishedProducts.length} items to cart!`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-black text-black" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-black text-black opacity-30" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 font-be-vietnam-pro gpu-layer">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 z-50 bg-black text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-gray-800"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 font-be-vietnam-pro">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-black font-semibold">Wishlist</span>
      </nav>

      {/* Wishlist Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4 sm:pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black text-black tracking-tight uppercase">
              YOUR WISHLIST
            </h1>
            <span className="bg-black/5 text-black border border-black/10 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Keep track of items you love and add them to your cart anytime.
          </p>
        </div>

        {/* Top Header Action Controls */}
        {wishedProducts.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-full transition-all shadow-md active:scale-98 cursor-pointer uppercase"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add All to Cart</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your wishlist?')) {
                  clearWishlist();
                  showToast('Wishlist cleared');
                }
              }}
              className="flex items-center gap-1 bg-[#F4F4F4] hover:bg-gray-200 text-gray-700 font-bold text-xs px-3 py-2.5 rounded-full transition-all cursor-pointer"
              title="Clear all saved items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Wishlist Content: 3 columns on mobile, 6 on desktop */}
      {wishedProducts.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          <AnimatePresence>
            {wishedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col justify-between bg-white border border-gray-100/90 rounded-2xl p-1.5 sm:p-3 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                {/* Remove Wishlist Button */}
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    showToast(`Removed from wishlist`);
                  }}
                  className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
                  title="Remove from Wishlist"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </button>

                {/* Product Image Preview: Strict 3:4 Aspect Ratio */}
                <div className="relative aspect-3/4 w-full bg-[#F0EEED] rounded-xl overflow-hidden mb-2">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {product.discount && (
                    <span className="absolute top-2 left-2 bg-black text-white font-extrabold text-[9px] rounded-full px-1.5 py-0.5 uppercase tracking-wider">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Product Meta */}
                <div className="space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-be-vietnam-pro font-bold text-[11px] sm:text-xs text-black group-hover:text-gray-600 transition-colors truncate">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 pt-0.5 text-[10px]">
                      <div className="flex items-center gap-0.5">
                        {renderStars(product.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Row & Action */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1 font-be-vietnam-pro">
                      <span className="font-black text-xs sm:text-sm text-black">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="font-bold text-[10px] text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full flex items-center justify-center gap-1 py-2 px-2 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-xs uppercase transition-all shadow-xs active:scale-98 cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span className="truncate">Add to Cart</span>
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
          className="bg-[#F4F4F4] rounded-3xl p-8 sm:p-14 text-center space-y-4 max-w-md mx-auto my-6"
        >
          <div className="w-14 h-14 bg-white text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-2xs">
            <Heart className="w-7 h-7 fill-rose-500/20" />
          </div>

          <div className="space-y-1">
            <h2 className="font-be-vietnam-pro-black text-lg font-bold text-black uppercase">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-medium">
              Explore our latest catalog and tap the heart icon on items you like to save them for later.
            </p>
          </div>

          <div>
            <Link
              href="/product"
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs uppercase px-7 py-3 rounded-full transition-all shadow-md"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black uppercase">
              YOU MIGHT ALSO LIKE
            </h2>
            <Link
              href="/product"
              className="text-xs font-bold text-black hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
