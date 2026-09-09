'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSizeSelection } from '@/context/SizeSelectionContext';
import { ProductCard } from '@/components/product/ProductCard';
import { WishlistItemCard } from '@/components/shop/WishlistItemCard';
import { Product } from '@/types/ecommerce';
import { getProductsApi } from '@/lib/productApi';

export default function WishlistPage() {
  const { wishlistProducts, toggleWishlist, clearWishlist, wishlistCount } = useCart();
  const { requestAddToCart } = useSizeSelection();
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const wishedProducts = wishlistProducts;

  React.useEffect(() => {
    getProductsApi({ limit: 8, sortBy: 'popular' })
      .then(({ products }) => {
        setRecommendedProducts(
          products.filter((product) => !wishedProducts.some((item) => item.id === product.id)).slice(0, 6),
        );
      })
      .catch(() => setRecommendedProducts([]));
  }, [wishedProducts]);

  const handleMoveToCart = (product: Product) => {
    requestAddToCart(product);
  };

  const handleAddAllToCart = () => {
    if (wishedProducts.length === 0) return;
    wishedProducts.forEach((product) => requestAddToCart(product));
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10 font-be-vietnam-pro gpu-layer">

      <nav className="flex items-center gap-2 text-xs text-gray-500 font-be-vietnam-pro">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>&gt;</span>
        <span className="text-black font-semibold">Wishlist</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-4 sm:pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-be-vietnam-pro-black text-xl sm:text-3xl font-black text-black tracking-tight uppercase">
              Your Wishlist
            </h1>
            <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-0.5 text-xs font-extrabold text-black">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Keep track of items you love and add them to your cart anytime.
          </p>
        </div>

        {wishedProducts.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAddAllToCart}
              className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-extrabold uppercase text-white shadow-md transition-all hover:bg-neutral-800 active:scale-98"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add All to Cart
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear your wishlist?')) {
                  clearWishlist();
                  toast.success('Wishlist cleared');
                }
              }}
              className="flex items-center gap-1 rounded-full bg-[#F4F4F4] px-3 py-2.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-200"
              title="Clear all saved items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        )}
      </div>

      {wishedProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence>
            {wishedProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.2 }}
              >
                <WishlistItemCard
                  product={product}
                  onRemove={() => {
                    toggleWishlist(product);
                    toast.success('Removed from wishlist');
                  }}
                  onAddToCart={() => handleMoveToCart(product)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
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

          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 text-xs font-extrabold uppercase text-white shadow-md transition-all hover:bg-neutral-800"
          >
            Explore Products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {recommendedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black uppercase">
              You Might Also Like
            </h2>
            <Link
              href="/product"
              className="text-xs font-bold text-black hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
