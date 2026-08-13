'use client';

import React from 'react';
import Link from 'next/link';
import { HeroBanner } from '../components/home/HeroBanner';
import { BrandBanner } from '../components/home/BrandBanner';
import { NewArrivals } from '../components/home/NewArrivals';
import { TopSelling } from '../components/home/TopSelling';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { CustomerReviews } from '../components/home/CustomerReviews';
import { NewsletterBanner } from '../components/home/NewsletterBanner';

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
