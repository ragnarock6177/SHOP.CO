'use client';

import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '../components/home/HeroBanner';
import { BrandBanner } from '../components/home/BrandBanner';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { CustomerReviews } from '../components/home/CustomerReviews';
import { NewsletterBanner } from '../components/home/NewsletterBanner';
import { ProductCard } from '../components/product/ProductCard';
import { PRODUCTS } from '../data/mockData';

export default function HomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew);
  const topSelling = PRODUCTS.filter((p) => p.tags?.includes('Top Selling'));

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Black Brand Banner (VERSACE, ZARA, GUCCI, PRADA, Calvin Klein) */}
      <BrandBanner />

      {/* 3. NEW ARRIVALS Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-4">
        <h2 className="font-integral text-3xl sm:text-4xl lg:text-5xl font-black text-black text-center tracking-tight">
          NEW ARRIVALS
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/shop?sort=newest"
            className="inline-block px-14 py-3.5 border border-gray-200 rounded-full font-medium text-sm text-black hover:bg-black hover:text-white transition-all shadow-sm"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-gray-200" />
      </div>

      {/* 4. TOP SELLING Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <h2 className="font-integral text-3xl sm:text-4xl lg:text-5xl font-black text-black text-center tracking-tight">
          TOP SELLING
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {topSelling.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/shop"
            className="inline-block px-14 py-3.5 border border-gray-200 rounded-full font-medium text-sm text-black hover:bg-black hover:text-white transition-all shadow-sm"
          >
            View All
          </Link>
        </div>
      </section>

      {/* 5. BROWSE BY DRESS STYLE Grid */}
      <CategoryGrid />

      {/* 6. OUR HAPPY CUSTOMERS Testimonials */}
      <CustomerReviews />

      {/* 7. Newsletter Subscription Banner */}
      <NewsletterBanner />
    </div>
  );
}
