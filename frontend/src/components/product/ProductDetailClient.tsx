'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSizeSelection } from '@/context/SizeSelectionContext';
import { ColorSwatch } from '@/components/product/ColorSwatch';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductWriteReviewForm } from '@/components/product/ProductWriteReviewForm';
import { Product, Review } from '@/types/ecommerce';
import { getProductReviewsApi, mapReviewToUi } from '@/lib/reviewApi';
import {
  getImagesForColor,
  getProductImageProps,
  PRODUCT_DETAIL_MAIN_SIZES,
  PRODUCT_DETAIL_THUMB_SIZES,
} from '@/lib/productMedia';
import {
  getAvailableSizes,
  getSizeStock,
  getVariantStock,
  LOW_STOCK_THRESHOLD,
  productRequiresSize,
  resolveProductColor,
  resolveVariant,
} from '@/lib/productVariants';
import { getProductLiveApi } from '@/lib/productApi';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

function getDefaultColor(product: Product): string {
  return resolveProductColor(product) || '';
}

const REVIEWS_BATCH_SIZE = 4;

function ReviewCardSkeleton() {
  return (
    <div className="border border-gray-200/90 rounded-2xl p-4 sm:p-6 bg-white space-y-3 animate-pulse">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 w-4 rounded-sm bg-gray-100" />
        ))}
      </div>
      <div className="h-4 w-32 rounded bg-gray-100" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
      </div>
      <div className="h-3 w-28 rounded bg-gray-100" />
    </div>
  );
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { toggleWishlist, isInWishlist } = useCart();
  const { token } = useAuth();
  const { requestAddToCart } = useSizeSelection();
  const isWished = isInWishlist(product.id);

  const initialColor = getDefaultColor(product);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState("");
  const [colorGallery, setColorGallery] = useState<string[]>(
    getImagesForColor(product, initialColor),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'faqs'>('desc');
  const prevColorRef = useRef(initialColor);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const gallery = getImagesForColor(product, selectedColor);
    const nextGallery = gallery.length > 0 ? gallery : [product.image];
    const colorChanged = prevColorRef.current !== selectedColor;
    prevColorRef.current = selectedColor;

    setActiveIndex(0);

    if (!colorChanged) {
      setColorGallery(nextGallery);
      return;
    }

    setIsGalleryLoading(true);

    let cancelled = false;
    const minDelay = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 180);
    });
    const imageLoad = new Promise<void>((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = nextGallery[0];
    });

    Promise.all([minDelay, imageLoad]).then(() => {
      if (cancelled) return;
      setColorGallery(nextGallery);
      setIsGalleryLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [product, selectedColor]);

  useEffect(() => {
    colorGallery.forEach((url) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [colorGallery]);

  const goToImage = (index: number) => {
    if (index === activeIndex || index < 0 || index >= colorGallery.length) return;
    setActiveIndex(index);
  };

  const goToNextImage = () => {
    if (colorGallery.length <= 1 || isGalleryLoading) return;
    setActiveIndex((prev) => (prev + 1) % colorGallery.length);
  };

  const goToPrevImage = () => {
    if (colorGallery.length <= 1 || isGalleryLoading) return;
    setActiveIndex((prev) => (prev - 1 + colorGallery.length) % colorGallery.length);
  };

  const handleGalleryTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleGalleryTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta > 0) goToPrevImage();
    else goToNextImage();
  };

  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_BATCH_SIZE);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({
    rating: product.rating,
    reviewsCount: product.reviewsCount,
  });
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  const catalogProduct = liveProduct ?? product;
  const productKey = product.slug || product.id;

  useEffect(() => {
    let cancelled = false;

    getProductLiveApi(productKey)
      .then((fresh) => {
        if (!cancelled && fresh) {
          setLiveProduct(fresh);
        }
      })
      .catch(() => {
        // Keep SSR product as fallback
      });

    return () => {
      cancelled = true;
    };
  }, [productKey, selectedColor, selectedSize]);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async (page = 1, append = false) => {
      setReviewsLoading(true);
      try {
        const data = await getProductReviewsApi(product.id, page, REVIEWS_BATCH_SIZE, token);
        if (cancelled) return;

        const mapped = data.items.map(mapReviewToUi);
        setReviewsList((prev) => (append ? [...prev, ...mapped] : mapped));
        setReviewSummary(data.summary);
        setHasMoreReviews(data.meta.hasNextPage);
        setReviewsPage(page);
        if (!append) {
          setVisibleReviewCount(REVIEWS_BATCH_SIZE);
        }
      } catch {
        if (!cancelled && !append) {
          setReviewsList([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews(1);

    return () => {
      cancelled = true;
    };
  }, [product.id, token]);

  const handleReviewSubmitted = async (result: { message: string; review?: Review }) => {
    setHasSubmittedReview(true);

    if (result.review?.id) {
      setReviewsList((prev) => {
        if (prev.some((item) => item.id === result.review!.id)) {
          return prev;
        }
        return [result.review!, ...prev];
      });
      setVisibleReviewCount((count) => count + 1);
      setReviewSummary((prev) => {
        const nextCount = prev.reviewsCount + 1;
        const nextRating =
          nextCount === 1
            ? result.review!.rating
            : Math.round(((prev.rating * prev.reviewsCount + result.review!.rating) / nextCount) * 10) / 10;
        return {
          reviewsCount: nextCount,
          rating: nextRating,
        };
      });
      return;
    }

    try {
      const data = await getProductReviewsApi(product.id, 1, REVIEWS_BATCH_SIZE, token);
      setReviewsList(data.items.map(mapReviewToUi));
      setReviewSummary(data.summary);
      setHasMoreReviews(data.meta.hasNextPage);
      setReviewsPage(1);
      setVisibleReviewCount(REVIEWS_BATCH_SIZE);
    } catch {
      // Keep current list if refresh fails
    }
  };

  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

  const availableSizes = useMemo(() => {
    return getAvailableSizes(catalogProduct, selectedColor || undefined);
  }, [catalogProduct, selectedColor]);

  const activeVariant = useMemo(() => {
    if (!catalogProduct.variants || catalogProduct.variants.length === 0) return null;
    if (productRequiresSize(catalogProduct) && !selectedSize) return null;

    return resolveVariant(
      catalogProduct,
      selectedColor || undefined,
      selectedSize || undefined,
    );
  }, [catalogProduct, selectedColor, selectedSize]);

  const currentPrice = activeVariant ? activeVariant.price : catalogProduct.price;
  const currentOriginalPrice = activeVariant?.compareAtPrice
    ? activeVariant.compareAtPrice
    : catalogProduct.originalPrice;

  const stockAvailable = getVariantStock(
    catalogProduct,
    selectedColor || undefined,
    selectedSize || undefined,
  );
  const selectionIncomplete = productRequiresSize(catalogProduct) && !selectedSize;
  const stockKnown = !selectionIncomplete;
  const isOutOfStock = stockKnown && stockAvailable <= 0;

  const handleAddToCart = () => {
    if (selectionIncomplete || isOutOfStock) return;
    requestAddToCart(product, selectedColor || undefined, quantity, {
      size: selectedSize || undefined,
      variantId: activeVariant?.id,
    });
  };

  const displayRating = reviewSummary.rating || catalogProduct.rating || 0;
  const displayReviewsCount = reviewSummary.reviewsCount ?? catalogProduct.reviewsCount ?? 0;
  const displayedReviews = reviewsList.slice(0, visibleReviewCount);
  const canViewMoreReviews =
    visibleReviewCount < reviewsList.length || hasMoreReviews;

  const handleViewMoreReviews = async () => {
    const nextVisibleCount = visibleReviewCount + REVIEWS_BATCH_SIZE;
    setReviewsLoadingMore(true);

    try {
      if (nextVisibleCount > reviewsList.length && hasMoreReviews) {
        const nextPage = reviewsPage + 1;
        const data = await getProductReviewsApi(
          product.id,
          nextPage,
          REVIEWS_BATCH_SIZE,
          token,
        );
        setReviewsList((prev) => [...prev, ...data.items.map(mapReviewToUi)]);
        setReviewSummary(data.summary);
        setHasMoreReviews(data.meta.hasNextPage);
        setReviewsPage(nextPage);
      }
      setVisibleReviewCount(nextVisibleCount);
    } finally {
      setReviewsLoadingMore(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#FFC633] text-[#FFC633]" />,
        );
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />);
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
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 -mx-3.5 flex flex-col gap-3 sm:-mx-6 sm:gap-4 md:mx-0">
          <div className="flex items-start justify-center gap-2.5 sm:gap-3 lg:justify-start">
            {/* Desktop vertical thumbnails */}
            <div className="hidden md:flex w-14 shrink-0 flex-col gap-2">
              {colorGallery.map((imgUrl, idx) => (
                <button
                  key={`${selectedColor}-${idx}-${imgUrl}`}
                  type="button"
                  onClick={() => goToImage(idx)}
                  className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl border transition-all cursor-pointer ${
                    activeIndex === idx
                      ? 'border-black opacity-100 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                  aria-current={activeIndex === idx}
                >
                  <Image
                    src={imgUrl}
                    alt={`${product.title} ${idx + 1}`}
                    fill
                    {...getProductImageProps(imgUrl, PRODUCT_DETAIL_THUMB_SIZES)}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main hero slider */}
            <div className="relative w-full max-w-none md:max-w-[360px] lg:max-w-[380px]">
              <div
                className="group relative aspect-[4/5] overflow-hidden rounded-none bg-neutral-200 select-none md:aspect-[3/4] md:rounded-2xl"
                onTouchStart={handleGalleryTouchStart}
                onTouchEnd={handleGalleryTouchEnd}
              >
                <div
                  className="flex h-full transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {colorGallery.map((imgUrl, idx) => {
                    const slideImageProps = getProductImageProps(imgUrl, PRODUCT_DETAIL_MAIN_SIZES);

                    return (
                      <div
                        key={`${selectedColor}-${idx}-${imgUrl}`}
                        className="relative h-full w-full shrink-0 basis-full"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${product.title} view ${idx + 1}`}
                          fill
                          priority={idx === 0}
                          unoptimized={slideImageProps.unoptimized}
                          quality={slideImageProps.quality}
                          sizes={slideImageProps.sizes}
                          className="object-cover pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    );
                  })}
                </div>

              {isGalleryLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
                  </div>
                </div>
              )}

              {colorGallery.length > 1 && !isGalleryLoading && (
                <>
                  {/* Desktop: dark edge overlays on hover for visible arrows */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-[15] hidden w-14 bg-gradient-to-r from-black/55 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-[15] hidden w-14 bg-gradient-to-l from-black/55 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block" />

                  <button
                    type="button"
                    onClick={goToPrevImage}
                    className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100 md:flex"
                    aria-label="Previous image"
                  >
                    <ChevronLeft
                      className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
                      strokeWidth={2.25}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center text-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100 md:flex"
                    aria-label="Next image"
                  >
                    <ChevronRight
                      className="h-7 w-7 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
                      strokeWidth={2.25}
                    />
                  </button>

                  {/* Mobile: Myntra-style swipe dots */}
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 md:hidden">
                    {colorGallery.map((_, idx) => (
                      <span
                        key={`dot-${selectedColor}-${idx}`}
                        className={`rounded-full bg-white transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.35)] ${
                          activeIndex === idx ? 'h-1.5 w-4' : 'h-1.5 w-1.5 opacity-55'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Desktop: subtle counter on hover */}
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 hidden -translate-x-1/2 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 md:block">
                    {activeIndex + 1} / {colorGallery.length}
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Ratings, Pricing, Selectors, Add to Cart */}
        <div className="lg:col-span-6 space-y-5">
          
          <div className="space-y-2 border-b border-gray-200/80 pb-4">
            <h1 className="font-be-vietnam-pro-black text-2xl sm:text-3xl lg:text-4xl font-black text-black leading-tight uppercase tracking-tight">
              {product.title}
            </h1>

            {/* Stars & Numerical Score */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-0.5">
                {renderStars(displayRating)}
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-black">
                {displayRating}<span className="text-gray-400 font-normal">/5</span>
              </span>
              {displayReviewsCount > 0 && (
                <span className="text-xs text-gray-500 font-medium">
                  ({displayReviewsCount} review{displayReviewsCount === 1 ? '' : 's'})
                </span>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-3">
            <span className="font-be-vietnam-pro-black text-2xl sm:text-3xl font-black text-black">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>

            {currentOriginalPrice && (
              <span className="font-be-vietnam-pro-black text-xl sm:text-2xl font-bold text-gray-400 line-through">
                ₹{currentOriginalPrice.toLocaleString('en-IN')}
              </span>
            )}

            {product.discount && (
              <span className="bg-black/5 text-black font-extrabold text-[11px] rounded-full px-3 py-1 border border-black/10">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Low-stock warning — only for selected variant when stock is 1–5 */}
          <div className="pt-0.5 min-h-[28px]">
            {stockKnown &&
              !isOutOfStock &&
              stockAvailable > 0 &&
              stockAvailable <= LOW_STOCK_THRESHOLD && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  Only {stockAvailable} left!
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
                Select Color:{" "}
                <span className="text-black capitalize">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {product.colors.map((c) => (
                  <ColorSwatch
                    key={c.name}
                    name={c.name}
                    hex={c.hex}
                    selected={selectedColor === c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      setSelectedSize('');
                      setQuantity(1);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-200/80" />

          {/* Choose Size */}
          {productRequiresSize(catalogProduct) && (
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider block">
                Choose Size
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const sizeStock = getSizeStock(catalogProduct, sz, selectedColor || undefined);
                  const isUnavailable = sizeStock <= 0;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => !isUnavailable && setSelectedSize(sz)}
                      disabled={isUnavailable}
                      aria-pressed={isSelected}
                      aria-disabled={isUnavailable}
                      title={isUnavailable ? `${sz} — out of stock` : `${sz} — select size`}
                      className={`relative min-w-[2.75rem] overflow-hidden rounded-full px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:py-2.5 ${
                        isSelected && !isUnavailable
                          ? 'bg-black text-white shadow-sm'
                          : isUnavailable
                            ? 'cursor-not-allowed border border-neutral-200 bg-neutral-50 text-neutral-400'
                            : 'bg-[#F4F4F4] text-neutral-800 hover:bg-neutral-200'
                      }`}
                    >
                      <span className={isUnavailable ? 'opacity-55' : undefined}>{sz}</span>
                      {isUnavailable && (
                        <span
                          className="pointer-events-none absolute left-1/2 top-1/2 block h-px w-[130%] -translate-x-1/2 -translate-y-1/2 rotate-[-24deg] bg-neutral-400/90"
                          aria-hidden
                        />
                      )}
                    </button>
                  );
                })}
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
                disabled={!stockKnown || quantity >= stockAvailable || isOutOfStock}
                className="p-1 text-black hover:text-gray-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || selectionIncomplete}
              className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-8 rounded-full font-extrabold text-xs sm:text-sm uppercase transition-all shadow-md active:scale-98 ${
                isOutOfStock || selectionIncomplete
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-neutral-800 text-white cursor-pointer'
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : selectionIncomplete
                  ? 'Select Size'
                  : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
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

        {/* Tab Content: Rating & Reviews — keep mounted so form is instant on tab switch */}
        <div className={activeTab === 'reviews' ? 'space-y-6 sm:space-y-8' : 'hidden'}>
          <div className="flex items-baseline gap-2">
            <h3 className="font-be-vietnam-pro-black text-lg sm:text-2xl font-black text-black uppercase">
              All Reviews
            </h3>
            <span className="text-xs sm:text-sm text-gray-400 font-medium">
              ({displayReviewsCount})
            </span>
          </div>

          <ProductWriteReviewForm
            productId={product.id}
            hasExistingReview={hasSubmittedReview}
            onSubmitted={handleReviewSubmitted}
          />

          {reviewsLoading && reviewsList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: REVIEWS_BATCH_SIZE }).map((_, index) => (
                <ReviewCardSkeleton key={index} />
              ))}
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF8E7]">
                <Star className="h-5 w-5 fill-[#FFC633] text-[#FFC633]" />
              </div>
              <p className="text-sm font-bold text-black">No reviews yet for this product</p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Be the first to share your experience. Your review helps other shoppers choose with confidence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border border-gray-200/90 rounded-2xl p-4 sm:p-6 bg-white space-y-2.5 relative shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-0.5">
                    {renderStars(rev.rating)}
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <h4 className="font-bold text-sm sm:text-base text-black">
                      {rev.userName}
                    </h4>
                    {rev.verified && (
                      <span
                        className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[9px]"
                        title="Verified Buyer"
                      >
                        <Check className="w-2.5 h-2.5 stroke-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-medium">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  <div className="text-[11px] text-gray-400 pt-1 font-medium">
                    {rev.date}
                  </div>
                </div>
              ))}
            </div>
          )}

          {canViewMoreReviews && reviewsList.length > 0 && (
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={reviewsLoadingMore}
                onClick={handleViewMoreReviews}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-gray-200 rounded-full font-bold text-xs text-black hover:bg-black hover:text-white transition-all cursor-pointer uppercase disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewsLoadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                View More
              </button>
            </div>
          )}
        </div>

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

    </div>
  );
}
