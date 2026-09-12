import React from "react";
import {
  getProductsApi,
  getDynamicFiltersApi,
  buildCatalogQueryFromParams,
  serializeCatalogQuery,
} from "@/lib/productApi";
import { ShopCatalogClient } from "@/components/shop/ShopCatalogClient";

export const revalidate = 15;

type ShopSearchParams = {
  category?: string;
  filter?: string;
  search?: string;
  maxPrice?: string;
  color?: string;
  size?: string;
  collection?: string;
  style?: string;
  sort?: string;
  page?: string;
  onSale?: string;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const catalogQuery = buildCatalogQueryFromParams(params as Record<string, string | undefined>);

  const [productsData, dynamicFilters] = await Promise.all([
    getProductsApi(catalogQuery),
    getDynamicFiltersApi(),
  ]);

  return (
    <ShopCatalogClient
      initialProducts={productsData.products}
      initialCategories={dynamicFilters.categories as any}
      initialFilterSettings={dynamicFilters}
      initialMeta={productsData.meta}
      initialQueryKey={serializeCatalogQuery(catalogQuery)}
    />
  );
}
