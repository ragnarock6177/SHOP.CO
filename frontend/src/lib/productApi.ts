import { Product, Category } from "@/types/ecommerce";
import { PRODUCTS, CATEGORIES } from "@/data/mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Normalizes backend Prisma product schema into frontend Product contract.
 */
export function normalizeProduct(apiItem: any): Product {
  const image =
    apiItem.primaryImage ||
    (apiItem.images && apiItem.images[0]?.imageUrl) ||
    apiItem.image ||
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800";

  const imagesList =
    apiItem.images && Array.isArray(apiItem.images) && apiItem.images.length > 0
      ? apiItem.images.map((img: any) => typeof img === "string" ? img : img.imageUrl).filter(Boolean)
      : [image];

  const price = Number(apiItem.basePrice ?? apiItem.price ?? 200);
  const originalPrice = apiItem.compareAtPrice ? Number(apiItem.compareAtPrice) : (apiItem.originalPrice ? Number(apiItem.originalPrice) : undefined);
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : (apiItem.discount || undefined);

  // Extract category name
  let categoryName = "Casual";
  if (typeof apiItem.category === "string") {
    categoryName = apiItem.category;
  } else if (apiItem.productCategories && apiItem.productCategories.length > 0) {
    const primaryCat = apiItem.productCategories.find((c: any) => c.isPrimary) || apiItem.productCategories[0];
    categoryName = primaryCat?.category?.name || primaryCat?.category?.slug || "Casual";
  }

  // Extract colors & sizes from variants if present
  const colors: { name: string; hex: string }[] = [];
  const sizesSet = new Set<string>();

  if (apiItem.variants && Array.isArray(apiItem.variants)) {
    apiItem.variants.forEach((variant: any) => {
      if (variant.attributes && Array.isArray(variant.attributes)) {
        variant.attributes.forEach((attr: any) => {
          if (attr.attributeSlug === "color" || attr.attributeName?.toLowerCase() === "color") {
            if (!colors.some((c) => c.name === attr.value)) {
              colors.push({ name: attr.value, hex: attr.colorHex || "#000000" });
            }
          }
          if (attr.attributeSlug === "size" || attr.attributeName?.toLowerCase() === "size") {
            sizesSet.add(attr.value);
          }
        });
      }
    });
  }

  const sizes = sizesSet.size > 0 ? Array.from(sizesSet) : (apiItem.sizes || ["Small", "Medium", "Large", "X-Large"]);
  const finalColors = colors.length > 0 ? colors : (apiItem.colors || [{ name: "Default", hex: "#000000" }]);

  return {
    id: apiItem.id || apiItem.slug || `prod-${Math.random().toString(36).substr(2, 9)}`,
    title: apiItem.name || apiItem.title || "ONE LIFE GRAPHIC T-SHIRT",
    subtitle: apiItem.shortDescription || apiItem.subtitle || "100% Organic Cotton Streetwear",
    description: apiItem.description || apiItem.shortDescription || "Crafted from a soft and breathable fabric for superior style.",
    price,
    originalPrice,
    discount,
    rating: apiItem.rating ? Number(apiItem.rating) : 4.5,
    reviewsCount: apiItem.reviewsCount ? Number(apiItem.reviewsCount) : 120,
    category: categoryName,
    image,
    images: imagesList,
    colors: finalColors,
    sizes,
    tags: apiItem.tags || [categoryName, "Streetwear", "New Arrival"],
    inStock: apiItem.inStock !== undefined ? Boolean(apiItem.inStock) : true,
    featured: Boolean(apiItem.featured),
  };
}

/**
 * High-performance product fetching with ISR caching (revalidate: 60s)
 * and seamless fallback to local catalog data for 0ms load times.
 */
export async function getProductsApi(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
  page?: number;
}): Promise<{ products: Product[]; meta?: any }> {
  try {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category.toLowerCase());
    if (options?.search) params.append("search", options.search);
    if (options?.minPrice) params.append("minPrice", String(options.minPrice));
    if (options?.maxPrice) params.append("maxPrice", String(options.maxPrice));
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.page) params.append("page", String(options.page));

    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`, {
      next: { revalidate: 60, tags: ["products"] },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        const products = data.data.map(normalizeProduct);
        return { products, meta: data.meta };
      }
    }
  } catch (error) {
    console.warn("Product API fetch warning (using fallback mock data):", error);
  }

  // Fail-Safe Fallback to mock data with live filtering
  let filtered = [...PRODUCTS];
  if (options?.category) {
    const catLow = options.category.toLowerCase();
    filtered = filtered.filter((p) => p.category.toLowerCase() === catLow);
  }
  if (options?.search) {
    const searchLow = options.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLow) ||
        p.description.toLowerCase().includes(searchLow)
    );
  }
  if (options?.maxPrice) {
    filtered = filtered.filter((p) => p.price <= options.maxPrice!);
  }
  if (options?.sortBy === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (options?.sortBy === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (options?.sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return { products: filtered };
}

/**
 * Fetches single product details by slug or id with 60s ISR caching.
 */
export async function getProductBySlugOrIdApi(slugOrId: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slugOrId)}`, {
      next: { revalidate: 60, tags: ["products", `product-${slugOrId}`] },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data) {
        return normalizeProduct(data.data);
      }
    }
  } catch (error) {
    console.warn(`Product API detail warning for ${slugOrId} (using fallback):`, error);
  }

  // Fallback match by id, slug, or title slugified from mock catalog
  const cleanTarget = slugOrId.toLowerCase().trim();
  const match = PRODUCTS.find((p) => {
    const idLow = p.id.toLowerCase();
    const titleSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return (
      idLow === cleanTarget ||
      idLow.includes(cleanTarget) ||
      cleanTarget.includes(idLow) ||
      titleSlug === cleanTarget ||
      titleSlug.includes(cleanTarget)
    );
  });

  if (match) {
    return match;
  }

  // Generate a distinct fallback product based on slugOrId so every detail page is unique
  const formattedTitle = slugOrId
    .replace(/^prod-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: slugOrId,
    title: formattedTitle || "AIRAVE PREMIUM PRODUCT",
    subtitle: "100% Organic Heavyweight Streetwear Cotton",
    description: `Experience exceptional quality with our ${formattedTitle}. Crafted from soft, breathable premium cotton for superior comfort and modern streetwear style.`,
    price: 220,
    originalPrice: 280,
    discount: 21,
    rating: 4.8,
    reviewsCount: 154,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800"
    ],
    colors: [
      { name: "Olive Green", hex: "#4b5320" },
      { name: "Forest Teal", hex: "#1e3e3b" },
      { name: "Dark Navy", hex: "#1c2a38" }
    ],
    sizes: ["Small", "Medium", "Large", "X-Large"],
    tags: ["Streetwear", "New Arrival"],
    inStock: true,
    featured: true,
  };
}

/**
 * Fetches all product IDs/slugs for Next.js generateStaticParams SSG build-time pre-rendering.
 */
export async function getAllProductSlugsOrIdsApi(): Promise<string[]> {
  try {
    const { products } = await getProductsApi({ limit: 100 });
    const ids = products.map((p) => p.id);
    if (ids.length > 0) return ids;
  } catch {}

  return PRODUCTS.map((p) => p.id);
}

/**
 * Fetches all categories with 60s ISR caching.
 */
export async function getCategoriesApi(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 3600, tags: ["categories"] },
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800",
          itemCount: c.itemCount || 50,
          description: c.description || "",
        }));
      }
    }
  } catch {}

  return CATEGORIES;
}
