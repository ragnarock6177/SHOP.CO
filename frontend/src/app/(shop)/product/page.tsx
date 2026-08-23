import React from "react";
import { getProductsApi, getCategoriesApi } from "@/lib/productApi";
import { getStorefrontSettingsApi } from "@/lib/settingsApi";
import { ShopCatalogClient } from "@/components/shop/ShopCatalogClient";

// Incremental Static Regeneration (ISR) - revalidate every 30 seconds
export const revalidate = 30;

/**
 * Server Component: Prefetches product catalog, category list, and filter settings
 * at build time / 30s ISR for instant 0ms initial load time on /product catalog page.
 */
export default async function ShopPage() {
  const [productsData, categories, settings] = await Promise.all([
    getProductsApi({ limit: 100 }),
    getCategoriesApi(),
    getStorefrontSettingsApi(),
  ]);

  return (
    <ShopCatalogClient
      initialProducts={productsData.products}
      initialCategories={categories}
      initialFilterSettings={settings.filters}
    />
  );
}
