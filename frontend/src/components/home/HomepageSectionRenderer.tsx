import React from 'react';
import dynamic from 'next/dynamic';
import { StorefrontHomepageSection } from '@/types/settings';
import { Product } from '@/types/ecommerce';
import { HeroBanner } from '@/components/home/HeroBanner';
import { BrandBanner } from '@/components/home/BrandBanner';
import { NewArrivals } from '@/components/home/NewArrivals';
import { CuratedCollections } from '@/components/home/CuratedCollections';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { EditorialShowcase } from '@/components/home/EditorialShowcase';
import { TopSelling } from '@/components/home/TopSelling';
import { PersonalizedRecommendations } from '@/components/home/PersonalizedRecommendations';
import { NewsletterBanner } from '@/components/home/NewsletterBanner';
import { ProductGridSection } from '@/components/home/ProductGridSection';

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

interface HomepageSectionRendererProps {
  section: StorefrontHomepageSection;
  initialProducts?: Product[];
}

export function HomepageSectionRenderer({ section, initialProducts }: HomepageSectionRendererProps) {
  if (!section.isEnabled) {
    return null;
  }

  switch (section.sectionType) {
    case 'HERO':
      return <HeroBanner />;
    
    case 'BRAND_BANNER':
      return <BrandBanner />;
    
    case 'NEW_ARRIVALS':
      return <NewArrivals section={section} initialProducts={initialProducts} />;
    
    case 'CURATED_COLLECTIONS':
      return <CuratedCollections />;
    
    case 'CATEGORY_GRID':
      return <CategoryGrid />;
    
    case 'EDITORIAL_SHOWCASE':
      return <EditorialShowcase />;
    
    case 'TOP_SELLING':
    case 'BEST_SELLERS':
      return <TopSelling section={section} initialProducts={initialProducts} />;
    
    case 'RECOMMENDATIONS':
    case 'TRENDING_PRODUCTS':
      return <PersonalizedRecommendations section={section} initialProducts={initialProducts} />;
    
    case 'CUSTOMER_REVIEWS':
      return <CustomerReviews />;
    
    case 'NEWSLETTER':
      return <NewsletterBanner />;
    
    case 'PRODUCT_GRID':
    case 'SALE_PRODUCTS':
    case 'FEATURED_PRODUCTS':
    case 'MANUAL':
      return <ProductGridSection section={section} initialProducts={initialProducts} />;

    default:
      console.warn(`Unknown homepage section type: '${section.sectionType}'. Skipping render.`);
      return null;
  }
}
