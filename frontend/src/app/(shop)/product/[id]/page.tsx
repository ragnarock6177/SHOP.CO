import React from "react";
import { notFound } from "next/navigation";
import {
  getProductBySlugOrIdApi,
  getAllProductSlugsOrIdsApi,
  getProductsApi,
} from "@/lib/productApi";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

// Incremental Static Regeneration (ISR) - revalidate every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

/**
 * Pre-renders all product detail pages at build time (SSG) for 0ms instant load speed.
 */
export async function generateStaticParams() {
  try {
    const ids = await getAllProductSlugsOrIdsApi();
    return ids.map((id) => ({ id }));
  } catch (error) {
    console.warn("Failed to generate static params for products:", error);
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const [product, { products: allProducts }] = await Promise.all([
    getProductBySlugOrIdApi(productId),
    getProductsApi({ limit: 8 }),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
