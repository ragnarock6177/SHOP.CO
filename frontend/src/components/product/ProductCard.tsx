'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useCart } from '../../context/CartContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWished = isInWishlist(product.id);

  // Render yellow stars matching rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-[#FFC633] text-[#FFC633] opacity-75" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-200 fill-gray-200" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="group flex flex-col justify-between space-y-3">
      
      {/* Product Image Card Container */}
      <div className="relative aspect-square bg-[#F0EEED] rounded-2xl overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Heart Overlay Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWished
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-black'
          }`}
          title={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add To Cart Button */}
        <button
          onClick={() => addToCart(product)}
          className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110 active:scale-95"
          title="Add to Cart"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>

      {/* Product Info Details */}
      <div className="space-y-1.5">
        
        {/* Product Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-base text-black group-hover:text-gray-600 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>

        {/* Rating Score with Yellow Stars */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center gap-0.5">
            {renderStars(product.rating)}
          </div>
          <span className="font-medium text-black">
            {product.rating}<span className="text-gray-400 font-normal">/5</span>
          </span>
        </div>

        {/* Pricing Row */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="font-extrabold text-lg sm:text-xl text-black">
            ${product.price}
          </span>

          {product.originalPrice && (
            <span className="font-bold text-lg sm:text-xl text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}

          {product.discount && (
            <span className="bg-[#FF3333]/10 text-[#FF3333] font-medium text-xs rounded-full px-2.5 py-0.5">
              -{product.discount}%
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
