import React from 'react';
import { getStorefrontSettingsApi } from '@/lib/settingsApi';
import { getProductsApi } from '@/lib/productApi';
import { HomepageSectionRenderer } from '@/components/home/HomepageSectionRenderer';
import { Product } from '@/types/ecommerce';
import { StorefrontHomepageSection } from '@/types/settings';

export const revalidate = 30; // 30 seconds ISR revalidation

const PRODUCT_SECTION_TYPES = new Set([
  'NEW_ARRIVALS',
  'TOP_SELLING',
  'BEST_SELLERS',
  'RECOMMENDATIONS',
  'TRENDING_PRODUCTS',
  'PRODUCT_GRID',
  'SALE_PRODUCTS',
  'FEATURED_PRODUCTS',
  'MANUAL',
]);

async function prefetchSectionProducts(section: StorefrontHomepageSection): Promise<Product[]> {
  if (!PRODUCT_SECTION_TYPES.has(section.sectionType)) {
    return [];
  }

  const limit = section.config?.limit || 6;
  const selectionMode = section.config?.selectionMode || 'LATEST';
  const selectedProductIds = section.config?.selectedProductIds;

  try {
    const { products } = await getProductsApi({
      limit,
      selectionMode: section.sectionType === 'TOP_SELLING' ? 'BEST_SELLING' : selectionMode,
      ids: selectedProductIds,
      sortBy: section.sectionType === 'TOP_SELLING' || section.sectionType === 'RECOMMENDATIONS' ? 'rating' : undefined,
    });
    return products;
  } catch (error) {
    console.warn(`Build-time pre-fetch warning for section ${section.sectionKey}:`, error);
    return [];
  }
}

export default async function HomePage() {
  const settings = await getStorefrontSettingsApi();
  
  // Filter and sort active homepage sections
  const sortedSections = (settings.home?.sections || [])
    .filter((sec) => sec.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Pre-fetch all section product datasets in parallel at build time / ISR revalidation
  const sectionProductEntries = await Promise.all(
    sortedSections.map(async (section) => {
      const products = await prefetchSectionProducts(section);
      return { sectionId: section.id || section.sectionKey, products };
    })
  );

  const productMap = new Map<string, Product[]>();
  sectionProductEntries.forEach((entry) => {
    productMap.set(entry.sectionId, entry.products);
  });

  return (
    <div className="pb-12 space-y-0">
      {sortedSections.map((section) => {
        const key = section.id || section.sectionKey;
        const initialProducts = productMap.get(key) || [];
        return (
          <HomepageSectionRenderer
            key={key}
            section={section}
            initialProducts={initialProducts}
          />
        );
      })}
    </div>
  );
}
