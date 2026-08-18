import React from "react";
import { getProductsApi } from "@/lib/productApi";
import { ShopCatalogClient } from "@/components/shop/ShopCatalogClient";

// Incremental Static Regeneration (ISR) - revalidate every 60 seconds
export const revalidate = 60;

/**
 * Server Component: Prefetches product catalog at build time (SSG + ISR)
 * for instant 0ms initial load time on /product page.
 */
export default async function ShopPage() {
  const { products } = await getProductsApi({ limit: 100 });

  return <ShopCatalogClient initialProducts={products} />;
}
