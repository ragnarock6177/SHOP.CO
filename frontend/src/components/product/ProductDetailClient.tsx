'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Check, 
  Minus, 
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/product/ProductCard';
import { WriteReviewModal } from '@/components/product/WriteReviewModal';
import { Product, Review } from '@/types/ecommerce';
import { REVIEWS } from '@/data/mockData';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWished = isInWishlist(product.id);

  const [selectedImage, setSelectedImage] = useState(
    product.images && product.images.length > 0 ? product.images[0] : product.image
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name : 'Olive Green'
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Large'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'faqs'>('reviews');

  // Match selected color and size to authoritative variant
  const activeVariant = React.useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) => {
        const colorAttr = v.attributes.find(
          (a) => a.attributeSlug === "color" || a.attributeName.toLowerCase() === "color"
        );
        const sizeAttr = v.attributes.find(
          (a) => a.attributeSlug === "size" || a.attributeName.toLowerCase() === "size"
        );
        const matchesColor =
          !selectedColor ||
          !colorAttr ||
          colorAttr.value.toLowerCase() === selectedColor.toLowerCase();
        const matchesSize =
          !selectedSize ||
          !sizeAttr ||
          sizeAttr.value.toLowerCase() === selectedSize.toLowerCase();
        return matchesColor && matchesSize;
      }) || product.variants[0]
    );
  }, [product.variants, selectedColor, selectedSize]);

  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentOriginalPrice = activeVariant?.compareAtPrice
    ? activeVariant.compareAtPrice
    : product.originalPrice;
  const stockAvailable = activeVariant
    ? activeVariant.stockAvailable
    : (product.stockAvailable ?? 50);
  const isOutOfStock = stockAvailable <= 0;

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(6);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedSize, activeVariant?.id);
  };

  const handleAddReview = (newReview: Review) => {
    setReviewsList([newReview, ...reviewsList]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black" />);
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black opacity-30" />);
      }
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-12 py-4 pb-16 font-be-vietnam-pro gpu-layer">
      
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>&gt;</span>
        <Link href="/product" className="hover:text-black transition-colors">Shop</Link>
        <span>&gt;</span>
        <span className="capitalize">{product.category}</span>
        <span>&gt;</span>
        <span className="text-black font-semibold truncate max-w-37.5 sm:max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        
        {/* Left Column: Gallery (Vertical Stack Desktop / Horizontal Mobile) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          
          {/* Desktop Vertical Thumbnails (3 Cols) */}
          <div className="hidden md:flex md:col-span-3 flex-col gap-3">
            {product.images && product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative aspect-3/4 w-full rounded-2xl overflow-hidden bg-[#F0EEED] border-2 transition-all cursor-pointer ${
                  selectedImage === imgUrl ? 'border-black scale-102 shadow-xs' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <Image src={imgUrl} alt={`${product.title} ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
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
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Mobile Horizontal Thumbnails */}
          <div className="flex md:hidden items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none pb-1 pt-1">
            {product.images && product.images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-16 h-20 rounded-xl overflow-hidden bg-[#F0EEED] border-2 transition-all shrink-0 cursor-pointer ${
                  selectedImage === imgUrl ? 'border-black' : 'border-transparent opacity-70'
                }`}
              >
                <Image src={imgUrl} alt={`${product.title} ${idx + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Title, Ratings, Pricing, Selectors, Add to Cart */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="space-y-2 border-b border-gray-200/80 pb-4">
            <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl lg:text-4xl font-black text-black leading-tight uppercase tracking-tight">
              {product.title}
            </h1>

            {/* Stars & Numerical Score */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-0.5">
                {renderStars(product.rating)}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-black">
                {product.rating}<span className="text-gray-400 font-normal">/5</span>
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-3">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-black">
              ${currentPrice}
            </span>

            {currentOriginalPrice && (
              <span className="font-be-vietnam-pro-black text-xl sm:text-2xl font-bold text-gray-400 line-through">
                ${currentOriginalPrice}
              </span>
            )}

            {product.discount && (
              <span className="bg-black/5 text-black font-extrabold text-[11px] rounded-full px-3 py-1 border border-black/10">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Live Variant Stock Status Badge */}
          <div className="pt-0.5">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                Out of Stock
              </span>
            ) : stockAvailable <= 5 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Only {stockAvailable} left in stock — order soon!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                In Stock ({stockAvailable} available)
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
            {product.description}
          </p>

          <hr className="border-gray-200/80" />

          {/* Select Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">
                Select Color: <span className="text-black capitalize">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor === c.name ? 'ring-2 ring-black ring-offset-2 scale-105' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200/80" />

          {/* Choose Size */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">
                Choose Size
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'bg-black text-white font-extrabold shadow-xs'
                        : 'bg-[#F4F4F4] text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200/80" />

          {/* Quantity Selector & Add to Cart */}
          <div className="flex items-center gap-2.5 sm:gap-4 pt-1">
            <div className="flex items-center bg-[#F4F4F4] rounded-full px-3 py-2 sm:px-4 sm:py-2.5 shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="p-1 text-black hover:text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <span className="w-8 sm:w-10 text-center font-bold text-xs sm:text-sm text-black">
                {isOutOfStock ? 0 : quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                disabled={quantity >= stockAvailable || isOutOfStock}
                className="p-1 text-black hover:text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase transition-all shadow-md active:scale-98 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-neutral-800 text-white cursor-pointer'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 sm:p-3.5 rounded-full border border-gray-200 transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isWished
                  ? 'bg-rose-50 border-rose-500 text-rose-500'
                  : 'bg-white text-gray-700 hover:border-black hover:text-black'
              }`}
              title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWished ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* Tabs Bar: Product Details | Rating & Reviews | FAQs */}
      <div className="pt-6 sm:pt-10 space-y-6 sm:space-y-8">
        <div className="flex border-b border-gray-200 justify-between text-center text-xs sm:text-sm font-bold text-gray-500">
          <button
            onClick={() => setActiveTab('desc')}
            className={`flex-1 pb-3 transition-all cursor-pointer ${
              activeTab === 'desc' ? 'text-black border-b-2 border-black font-extrabold' : 'hover:text-black'
            }`}
          >
            Product Details
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 pb-3 transition-all cursor-pointer ${
              activeTab === 'reviews' ? 'text-black border-b-2 border-black font-extrabold' : 'hover:text-black'
            }`}
          >
            Rating & Reviews
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex-1 pb-3 transition-all cursor-pointer ${
              activeTab === 'faqs' ? 'text-black border-b-2 border-black font-extrabold' : 'hover:text-black'
            }`}
          >
            FAQs
          </button>
        </div>

        {/* Tab Content: Rating & Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <h3 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black uppercase">
                  All Reviews
                </h3>
                <span className="text-xs sm:text-sm text-gray-400 font-medium">
                  ({reviewsList.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWriteReviewOpen(true)}
                  className="bg-black hover:bg-neutral-800 text-white font-extrabold text-xs px-4 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all shadow-md cursor-pointer uppercase"
                >
                  Write Review
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsList.slice(0, visibleReviewsCount).map((rev) => (
                <div
                  key={rev.id}
                  className="border border-gray-200/90 rounded-2xl p-4 sm:p-6 bg-white space-y-2.5 relative shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {renderStars(rev.rating)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <h4 className="font-bold text-sm sm:text-base text-black">
                      {rev.userName}
                    </h4>
                    {rev.verified && (
                      <span className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px]" title="Verified Buyer">
                        <Check className="w-2.5 h-2.5 stroke-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">
                    "{rev.comment}"
                  </p>

                  <div className="text-[11px] text-gray-400 pt-1 font-medium">
                    {rev.date}
                  </div>
                </div>
              ))}
            </div>

            {visibleReviewsCount < reviewsList.length && (
              <div className="text-center pt-2">
                <button
                  onClick={() => setVisibleReviewsCount((prev) => prev + 4)}
                  className="px-8 py-3 border border-gray-200 rounded-full font-bold text-xs text-black hover:bg-black hover:text-white transition-all cursor-pointer uppercase"
                >
                  Load More Reviews
                </button>
              </div>
            )}

          </div>
        )}

        {activeTab === 'desc' && (
          <div className="bg-[#F4F4F4] rounded-2xl p-5 sm:p-7 space-y-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
            <p>{product.description}</p>
            <p>100% Organic Heavyweight Cotton. Designed for casual, street, and relaxed styling with superior stitch durability.</p>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="bg-[#F4F4F4] rounded-2xl p-5 sm:p-7 space-y-3.5 text-xs sm:text-sm text-gray-700 font-medium">
            <div>
              <h4 className="font-bold text-black text-sm">Q: What is the fabric composition?</h4>
              <p className="mt-0.5 text-gray-600">A: Made from 100% premium organic combed cotton for ultra-soft breathable comfort.</p>
            </div>
            <div>
              <h4 className="font-bold text-black text-sm">Q: How should I care for this product?</h4>
              <p className="mt-0.5 text-gray-600">A: Machine wash cold with like colors, tumble dry low or line dry to preserve fabric quality.</p>
            </div>
          </div>
        )}

      </div>

      {/* YOU MIGHT ALSO LIKE Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 sm:space-y-8 pt-8 border-t border-gray-200/80">
          <h2 className="font-be-vietnam-pro-black text-xl sm:text-3xl lg:text-4xl font-black text-black text-center uppercase tracking-tight">
            YOU MIGHT ALSO LIKE
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteReviewOpen}
        onClose={() => setIsWriteReviewOpen(false)}
        onSubmitReview={handleAddReview}
      />

    </div>
  );
}
