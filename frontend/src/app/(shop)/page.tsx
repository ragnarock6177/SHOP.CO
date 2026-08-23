import React from 'react';
import dynamic from 'next/dynamic';
import { HeroBanner } from '@/components/home/HeroBanner';
import { BrandBanner } from '@/components/home/BrandBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { CuratedCollections } from '@/components/home/CuratedCollections';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { EditorialShowcase } from '@/components/home/EditorialShowcase';
import { TopSelling } from '@/components/home/TopSelling';
import { PersonalizedRecommendations } from '@/components/home/PersonalizedRecommendations';
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
    <div className="pb-12">
      {/* 1. Hero Poster Banner & Narrow Brand Marquee (Flush together with 0 gap) */}
      <div>
        <HeroBanner />
        <BrandBanner />
      </div>

      {/* 2. New Arrivals with Category Filter Tabs */}
      <NewArrivals />

      {/* 3. Curated Product Collections Lineup */}
      <CuratedCollections />

      {/* 4. Browse By Dress Style Bento Grid */}
      <CategoryGrid />

      {/* 5. High-Fashion Editorial Campaign Showcase */}
      <EditorialShowcase />

      {/* 6. Top Selling Bestsellers */}
      <TopSelling />

      {/* 7. Tailored Product Recommendations Carousel */}
      <PersonalizedRecommendations />

      {/* 8. Customer Reviews & Testimonials Marquee */}
      <CustomerReviews />

      {/* 9. VIP Club Newsletter Banner */}
      <NewsletterBanner />
    </div>
  );
}
