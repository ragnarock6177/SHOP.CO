'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Check, 
  Minus, 
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { PRODUCTS, REVIEWS } from '../../../data/mockData';
import { useCart } from '../../../context/CartContext';
import { ProductCard } from '../../../components/product/ProductCard';
import { WriteReviewModal } from '../../../components/product/WriteReviewModal';
import { Review } from '../../../types/ecommerce';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.id as string) || 'prod-one-life';

  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWished = isInWishlist(product.id);

  const [selectedImage, setSelectedImage] = useState(product.image);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Olive Green'
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[2] : 'Large'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'faqs'>('reviews');

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(6);

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  const handleAddReview = (newReview: Review) => {
    setReviewsList([newReview, ...reviewsList]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 fill-[#FFC633] text-[#FFC633] opacity-60" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 py-4 pb-16">
      
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <span>&gt;</span>
        <span className="capitalize">Men</span>
        <span>&gt;</span>
        <span className="text-black font-semibold">T-shirts</span>
      </nav>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Gallery (Vertical Stack Desktop / Horizontal Mobile) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Desktop Vertical Thumbnails (3 Cols) */}
          <div className="hidden md:flex md:col-span-3 flex-col gap-3">
            {product.images && product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F0EEED] border-2 transition-all ${
                  selectedImage === imgUrl ? 'border-black scale-105 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Hero Preview Frame (9 Cols) */}
          <div className="md:col-span-9 relative aspect-square w-full rounded-3xl bg-[#F0EEED] overflow-hidden">
            <Image
              src={selectedImage}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Mobile Horizontal Thumbnails */}
          <div className="flex md:hidden items-center gap-3 overflow-x-auto pb-1">
            {product.images && product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-[#F0EEED] border-2 transition-all shrink-0 ${
                  selectedImage === imgUrl ? 'border-black' : 'border-transparent opacity-70'
                }`}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Title, Ratings, Pricing, Selectors, Add to Cart */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="space-y-2 border-b border-gray-200 pb-5">
            <h1 className="font-integral text-3xl sm:text-4xl font-black text-black leading-tight uppercase">
              {product.title}
            </h1>

            {/* Stars & Numerical Score */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-0.5">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm font-bold text-black">
                {product.rating}<span className="text-gray-400 font-normal">/5</span>
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-3">
            <span className="font-integral text-3xl font-black text-black">
              ${product.price}
            </span>

            {product.originalPrice && (
              <span className="font-integral text-2xl font-bold text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}

            {product.discount && (
              <span className="bg-[#FF3333]/10 text-[#FF3333] font-bold text-xs rounded-full px-3 py-1">
                -{product.discount}%
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.
          </p>

          <hr className="border-gray-200" />

          {/* Select Colors */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase block">
              Select Colors
            </label>
            <div className="flex items-center gap-3">
              {product.colors && product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === c.name ? 'ring-2 ring-black ring-offset-2 scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColor === c.name && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Choose Size */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase block">
              Choose Size
            </label>
            <div className="flex flex-wrap gap-2.5">
              {['Small', 'Medium', 'Large', 'X-Large'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-5 py-3 rounded-full text-xs font-medium transition-all ${
                    selectedSize === sz
                      ? 'bg-black text-white font-bold'
                      : 'bg-[#F0F0F0] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1 text-black hover:text-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-black">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-1 text-black hover:text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 py-4 px-8 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-sm transition-all shadow-md active:scale-95"
            >
              Add to Cart
            </button>
          </div>

        </div>

      </div>

      {/* Tabs Bar: Product Details | Rating & Reviews | FAQs */}
      <div className="pt-8 space-y-8">
        <div className="flex border-b border-gray-200 justify-between text-center text-sm font-medium text-gray-500">
          <button
            onClick={() => setActiveTab('desc')}
            className={`flex-1 pb-4 transition-all ${
              activeTab === 'desc' ? 'text-black border-b-2 border-black font-bold' : 'hover:text-black'
            }`}
          >
            Product Details
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 pb-4 transition-all ${
              activeTab === 'reviews' ? 'text-black border-b-2 border-black font-bold' : 'hover:text-black'
            }`}
          >
            Rating & Reviews
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex-1 pb-4 transition-all ${
              activeTab === 'faqs' ? 'text-black border-b-2 border-black font-bold' : 'hover:text-black'
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Tab Content: Rating & Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Reviews Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl sm:text-2xl text-black">
                  All Reviews
                </h3>
                <span className="text-sm text-gray-400 font-normal">
                  ({reviewsList.length})
                </span>
              </div>

              {/* Action Buttons: Filter, Sort Dropdown, Write a Review */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => alert('Filter reviews triggered')}
                  className="p-3 bg-[#F0F0F0] rounded-full text-black hover:bg-gray-200 transition-colors"
                  title="Filter Reviews"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>

                <div className="relative hidden sm:block">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#F0F0F0] text-black text-xs font-bold rounded-full px-4 py-3 pr-8 appearance-none cursor-pointer focus:outline-none"
                  >
                    <option value="latest">Latest</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-black absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-md"
                >
                  Write a Review
                </button>
              </div>
            </div>

            {/* 6 Review Cards Grid (2 cols desktop, 1 col mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {reviewsList.slice(0, visibleReviewsCount).map((rev) => (
                <div
                  key={rev.id}
                  className="border border-gray-200/90 rounded-3xl p-6 sm:p-7 bg-white space-y-3 relative shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top Row: 5 Yellow Stars + 3 Dots Options Menu */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {renderStars(rev.rating)}
                    </div>
                    <button
                      onClick={() => alert(`Options for review by ${rev.userName}`)}
                      className="p-1 text-gray-400 hover:text-black"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Customer Name & Green Verified Badge */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <h4 className="font-bold text-base sm:text-lg text-black">
                      {rev.userName}
                    </h4>
                    {rev.verified && (
                      <span className="w-4 h-4 rounded-full bg-[#01AB31] text-white flex items-center justify-center text-[10px]" title="Verified Buyer">
                        <Check className="w-2.5 h-2.5 stroke-3" />
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {/* Posted Date */}
                  <div className="text-xs text-gray-400 pt-2 font-medium">
                    {rev.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Reviews Pill Button */}
            {visibleReviewsCount < reviewsList.length && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleReviewsCount((prev) => prev + 4)}
                  className="px-10 py-3.5 border border-gray-200 rounded-full font-bold text-xs sm:text-sm text-black hover:bg-black hover:text-white transition-all"
                >
                  Load More Reviews
                </button>
              </div>
            )}

          </div>
        )}

        {/* Tab Content: Product Details */}
        {activeTab === 'desc' && (
          <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-8 space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <p>{product.description}</p>
            <p>100% Organic Heavyweight Cotton. Designed for casual, street, and relaxed styling with superior stitch durability.</p>
          </div>
        )}

        {/* Tab Content: FAQs */}
        {activeTab === 'faqs' && (
          <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-gray-700">
            <div>
              <h4 className="font-bold text-black text-sm sm:text-base">Q: What is the fabric composition?</h4>
              <p className="mt-1">A: Made from 100% premium organic combed cotton for ultra-soft breathable comfort.</p>
            </div>
            <div>
              <h4 className="font-bold text-black text-sm sm:text-base">Q: How should I care for this t-shirt?</h4>
              <p className="mt-1">A: Machine wash cold with like colors, tumble dry low or line dry to preserve graphic print quality.</p>
            </div>
          </div>
        )}

      </div>

      {/* YOU MIGHT ALSO LIKE Section */}
      <div className="space-y-8 pt-12 border-t border-gray-200">
        <h2 className="font-integral text-3xl sm:text-4xl font-black text-black text-center uppercase tracking-tight">
          YOU MIGHT ALSO LIKE
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((relProd) => (
            <ProductCard key={relProd.id} product={relProd} />
          ))}
        </div>
      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        onSubmitReview={handleAddReview}
      />

    </div>
  );
}
