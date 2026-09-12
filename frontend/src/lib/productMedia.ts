import { Product, ProductImageMeta } from "@/types/ecommerce";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1200";

/** Lossless-ish delivery for catalog/product imagery. */
export const PRODUCT_IMAGE_QUALITY = 100;

/** Catalog cards — request full column width on retina. */
export const PRODUCT_CARD_IMAGE_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 480px";

/** PDP hero — near-original on desktop, full viewport on mobile. */
export const PRODUCT_DETAIL_MAIN_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1280px) 800px, 1200px";

/** PDP thumbnails (56px display × retina). */
export const PRODUCT_DETAIL_THUMB_SIZES = "128px";

/** Serve uploaded catalog assets without Next re-encoding (true OG file). */
export function isCatalogProductImageSource(url: string): boolean {
  if (!url) return false;

  const lower = url.toLowerCase();
  if (lower.includes("images.unsplash.com") || lower.startsWith("data:")) {
    return false;
  }

  return (
    lower.includes(".supabase.co") ||
    lower.includes("localhost:5000") ||
    lower.includes("/uploads/") ||
    lower.includes("/storage/v1/object/")
  );
}

export function getProductImageProps(src: string, sizes: string) {
  const useOriginal = isCatalogProductImageSource(src);

  return {
    unoptimized: useOriginal,
    quality: PRODUCT_IMAGE_QUALITY,
    sizes,
  } as const;
}

export function getImagesForColor(
  product: Pick<Product, "images" | "imagesByColor" | "allImages">,
  colorName?: string,
): string[] {
  if (colorName && product.imagesByColor?.[colorName]?.length) {
    return product.imagesByColor[colorName];
  }

  if (product.allImages?.length) {
    return product.allImages.map((img) => img.url);
  }

  return product.images?.length ? product.images : [PLACEHOLDER_IMAGE];
}

export function getPrimaryImageForColor(
  product: Pick<Product, "image" | "images" | "imagesByColor" | "allImages" | "defaultColor">,
  colorName?: string,
): string {
  const resolvedColor = colorName || product.defaultColor;
  const gallery = getImagesForColor(product, resolvedColor);
  return gallery[0] || product.image || PLACEHOLDER_IMAGE;
}

export function buildAllImages(apiItem: any): ProductImageMeta[] {
  if (!Array.isArray(apiItem.images)) return [];

  return apiItem.images
    .map((img: any) => {
      if (typeof img === "string") {
        return { url: img };
      }

      return {
        id: img.id,
        url: img.imageUrl || img.url,
        altText: img.altText,
        variantIds: img.variantIds || [],
        isPrimary: img.isPrimary,
      };
    })
    .filter((img: ProductImageMeta) => Boolean(img.url));
}

export { PLACEHOLDER_IMAGE };
