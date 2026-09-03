import React from "react";
import type { Metadata } from "next";
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

function getAbsoluteUrl(url?: string | null): string {
  const fallback = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200";
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://frontend-beta-murex-33.vercel.app");

  return `${siteBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

/**
 * Dynamic On-Page SEO: Title, Meta Description, OpenGraph, and Canonical URL
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySlugOrIdApi(resolvedParams.id);
  if (!product) {
    return { title: "Product Not Found | AIRAVÉ" };
  }

  const siteBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://frontend-beta-murex-33.vercel.app");

  const siteName = "AIRAVÉ";
  const title = `${product.title} | ${siteName}`;
  const description =
    product.subtitle ||
    product.description ||
    `Shop ${product.title} at AIRAVÉ. Minimalist high-fashion streetwear and contemporary luxury apparel.`;

  const rawImage = product.images?.[0] || product.image;
  const absoluteImageUrl = getAbsoluteUrl(rawImage);
  const canonicalUrl = `${siteBaseUrl}/product/${product.slug || product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: absoluteImageUrl,
          secureUrl: absoluteImageUrl,
          width: 1200,
          height: 1600,
          alt: product.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
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

  // Schema.org Structured Data for Google Merchant & Rich Search Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images && product.images.length > 0 ? product.images : [product.image],
    description: product.description || product.subtitle || product.title,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "AIRAVÉ",
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      url: `https://airave.com/product/${product.slug || product.id}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      availability:
        (product.stockAvailable ?? 0) > 0 || product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
