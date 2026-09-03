import React from "react";
import { getProductsApi, getDynamicFiltersApi } from "@/lib/productApi";
import { ShopCatalogClient } from "@/components/shop/ShopCatalogClient";

// Incremental Static Regeneration (ISR) - revalidate every 30 seconds
export const revalidate = 30;

/**
 * Server Component: Prefetches default product catalog (page 1, limit 12, default filters)
 * and 100% dynamic catalog filters directly from database.
 */
export default async function ShopPage() {
  const [productsData, dynamicFilters] = await Promise.all([
    getProductsApi({ limit: 12, page: 1, sortBy: "popular" }),
    getDynamicFiltersApi(),
  ]);

  return (
    <ShopCatalogClient
      initialProducts={productsData.products}
      initialCategories={dynamicFilters.categories as any}
      initialFilterSettings={dynamicFilters}
      initialMeta={productsData.meta}
    />
  );
}
