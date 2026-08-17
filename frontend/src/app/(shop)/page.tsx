import React from 'react';
import dynamic from 'next/dynamic';
import { HeroBanner } from '@/components/home/HeroBanner';
import { BrandBanner } from '@/components/home/BrandBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { TopSelling } from '@/components/home/TopSelling';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NewsletterBanner } from '@/components/home/NewsletterBanner';

// Dynamically import CustomerReviews (GSAP marquee animation) to split heavy JS bundle
const CustomerReviews = dynamic(
  () => import('@/components/home/CustomerReviews').then((mod) => mod.CustomerReviews),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-400">Loading Customer Reviews...</span>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Banner */}
      <HeroBanner />

      <BrandBanner />

      {/* 3. NEW ARRIVALS Section */}
      <NewArrivals />

      {/* 4. TOP SELLING Section */}
      <TopSelling />

      {/* 5. BROWSE BY DRESS STYLE Grid */}
      <CategoryGrid />

      {/* 6. OUR HAPPY CUSTOMERS Testimonials */}
      <CustomerReviews />

      {/* 7. Newsletter Subscription Banner */}
      <NewsletterBanner />
    </div>
  );
}
