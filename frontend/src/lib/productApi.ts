import { Product, Category } from "@/types/ecommerce";
import { dedupedFetch } from "@/lib/fetchCache";
import {
  PLACEHOLDER_IMAGE,
  buildAllImages,
  getImagesForColor,
  getPrimaryImageForColor,
} from "@/lib/productMedia";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "https://backend-rho-umber-75.vercel.app/api/v1";

const EMPTY_FILTERS = {
  minPrice: 0,
  maxPrice: 0,
  availableColors: [] as Array<{ name: string; hex: string; count: number }>,
  availableSizes: [] as string[],
  categories: [] as Array<{ id: string; name: string; slug: string; count: number }>,
  collections: [] as Array<{ id: string; name: string; slug: string; count: number }>,
};

function getCatalogFetchInit(): RequestInit {
  if (typeof window !== "undefined") {
    return { cache: "no-store" };
  }

  return { next: { revalidate: 15, tags: ["products"] } };
}

function parseApiList<T>(payload: unknown): T[] {
  if (!payload || typeof payload !== "object") return [];
  const data = (payload as { data?: unknown }).data;
  return Array.isArray(data) ? (data as T[]) : [];
}

export function normalizeProduct(apiItem: any): Product {
  const allImages = buildAllImages(apiItem);
  const imagesByColor: Record<string, string[]> = apiItem.imagesByColor || {};
  const defaultColor = apiItem.defaultColor || undefined;
  const primaryCategory =
    apiItem.productCategories?.find((c: any) => c.isPrimary) ||
    apiItem.productCategories?.[0];

  const image = resolveProductImage(apiItem, primaryCategory);
  const gallery =
    apiItem.defaultGallery ||
    getImagesForColor(
      {
        images: allImages.map((img) => img.url),
        imagesByColor,
        allImages,
      },
      defaultColor,
    );

  const imagesList =
    gallery.length > 0
      ? gallery
      : allImages.length > 0
        ? allImages.map((img) => img.url)
        : [image];

  const price = Number(apiItem.basePrice ?? apiItem.price ?? 0);
  const originalPrice = apiItem.compareAtPrice
    ? Number(apiItem.compareAtPrice)
    : apiItem.originalPrice
      ? Number(apiItem.originalPrice)
      : undefined;
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : apiItem.discount || undefined;

  let categoryName = "Uncategorized";
  if (typeof apiItem.category === "string") {
    categoryName = apiItem.category;
  } else if (apiItem.productCategories?.length) {
    categoryName =
      primaryCategory?.category?.name || primaryCategory?.category?.slug || categoryName;
  }

  const colors: { name: string; hex: string }[] = [];
  const sizesSet = new Set<string>();

  if (Array.isArray(apiItem.variants)) {
    apiItem.variants.forEach((variant: any) => {
      if (variant.colorName && !colors.some((c) => c.name === variant.colorName)) {
        colors.push({
          name: variant.colorName,
          hex: variant.colorHex || "#000000",
        });
      }

      if (variant.sizeName) {
        sizesSet.add(variant.sizeName);
      }

      const attrs = variant.attributes || [];
      attrs.forEach((attr: any) => {
        if (attr.attributeSlug === "color" || attr.attributeName?.toLowerCase() === "color") {
          if (!colors.some((c) => c.name === attr.value)) {
            colors.push({ name: attr.value, hex: attr.colorHex || "#000000" });
          }
        }
        if (attr.attributeSlug === "size" || attr.attributeName?.toLowerCase() === "size") {
          sizesSet.add(attr.value);
        }
      });
    });
  }

  const title = apiItem.name || apiItem.title || "Untitled Product";
  const slug =
    apiItem.slug ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") ||
    apiItem.id;

  const variants = Array.isArray(apiItem.variants)
    ? apiItem.variants.map((v: any) => ({
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
        stockAvailable: Number(
          v.stockAvailable ??
            (v.inventory
              ? Math.max(0, v.inventory.quantityOnHand - v.inventory.quantityReserved)
              : 0),
        ),
        isDefault: Boolean(v.isDefault),
        attributes: Array.isArray(v.attributes)
          ? v.attributes
          : Array.isArray(v.variantAttributeValues)
            ? v.variantAttributeValues.map((vav: any) => ({
                attributeSlug: vav.attributeValue?.attribute?.slug || "",
                attributeName: vav.attributeValue?.attribute?.name || "",
                valueSlug: vav.attributeValue?.slug || "",
                value: vav.attributeValue?.value || "",
                colorHex: vav.attributeValue?.colorHex || undefined,
              }))
            : [],
      }))
    : undefined;

  const totalStockAvailable =
    variants && variants.length > 0
      ? variants.reduce(
          (sum: number, v: { stockAvailable?: number }) => sum + (v.stockAvailable || 0),
          0,
        )
      : Number(apiItem.stockQuantity ?? 0);

  const resolvedDefaultColor =
    defaultColor || (colors.length > 0 ? colors[0].name : undefined);

  return {
    id: apiItem.id,
    slug,
    title,
    subtitle: apiItem.shortDescription || apiItem.subtitle || "",
    description:
      apiItem.description ||
      apiItem.shortDescription ||
      "Product details will be updated soon.",
    price,
    originalPrice,
    discount,
    rating: apiItem.rating ? Number(apiItem.rating) : 0,
    reviewsCount: apiItem.reviewsCount ? Number(apiItem.reviewsCount) : 0,
    category: categoryName,
    image: getPrimaryImageForColor(
      {
        image,
        images: imagesList,
        imagesByColor,
        allImages,
        defaultColor: resolvedDefaultColor,
      },
      resolvedDefaultColor,
    ),
    images: getImagesForColor(
      { images: imagesList, imagesByColor, allImages },
      resolvedDefaultColor,
    ),
    allImages,
    imagesByColor,
    defaultColor: resolvedDefaultColor,
    colors: colors.length > 0 ? colors : undefined,
    sizes: sizesSet.size > 0 ? Array.from(sizesSet) : apiItem.sizes || undefined,
    tags: apiItem.tags || [categoryName],
    inStock: totalStockAvailable > 0,
    stockAvailable: totalStockAvailable,
    variants,
    featured: Boolean(apiItem.featured),
    isNew: Boolean(apiItem.isNew),
    careInstructions: apiItem.careInstructions || undefined,
  };
}

function resolveProductImage(apiItem: any, primaryCategory?: any): string {
  if (apiItem.primaryImage) return apiItem.primaryImage;
  if (apiItem.images?.[0]?.imageUrl) return apiItem.images[0].imageUrl;
  if (typeof apiItem.images?.[0] === "string") return apiItem.images[0];
  if (apiItem.image) return apiItem.image;
  if (primaryCategory?.category?.imageUrl) return primaryCategory.category.imageUrl;
  return PLACEHOLDER_IMAGE;
}

export async function getProductsApi(options?: {
  category?: string;
  collection?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  sortBy?: string;
  selectionMode?: string;
  ids?: string[];
  featured?: boolean;
  onSale?: boolean;
  limit?: number;
  page?: number;
}): Promise<{ products: Product[]; meta?: any }> {
  const cacheKey = `products_${JSON.stringify(options || {})}`;

  return dedupedFetch(cacheKey, async () => {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category.toLowerCase());
    if (options?.collection) params.append("collection", options.collection.toLowerCase());
    if (options?.search) params.append("search", options.search);
    if (options?.minPrice !== undefined) params.append("minPrice", String(options.minPrice));
    if (options?.maxPrice !== undefined) params.append("maxPrice", String(options.maxPrice));
    if (options?.colors?.length) params.append("colors", options.colors.join(","));
    if (options?.sizes?.length) params.append("sizes", options.sizes.join(","));
    if (options?.sortBy) params.append("sortBy", options.sortBy);
    if (options?.selectionMode) params.append("selectionMode", options.selectionMode);
    if (options?.ids?.length) params.append("ids", options.ids.join(","));
    if (options?.featured !== undefined) params.append("featured", String(options.featured));
    if (options?.onSale !== undefined) params.append("onSale", String(options.onSale));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.page) params.append("page", String(options.page));

    const response = await fetch(
      `${API_BASE_URL}/products?${params.toString()}`,
      getCatalogFetchInit(),
    );

    if (!response.ok) {
      return { products: [], meta: undefined };
    }

    const payload = await response.json();
    const items = parseApiList<any>(payload);
    const products = items
      .map(normalizeProduct)
      .filter((product) => product.id && product.title);

    return {
      products,
      meta: (payload as { meta?: unknown }).meta,
    };
  });
}

export async function getProductBySlugOrIdApi(slugOrId: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slugOrId)}`, {
    next: { revalidate: 30, tags: ["products", `product-${slugOrId}`] },
    ...(typeof window !== "undefined" ? { cache: "no-store" as RequestCache } : {}),
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const item = (payload as { data?: unknown }).data;
  if (!item) return null;
  return normalizeProduct(item);
}

export async function getAllProductSlugsOrIdsApi(): Promise<string[]> {
  const { products } = await getProductsApi({ limit: 100 });
  return products.map((product) => product.slug || product.id);
}

export async function getCategoriesApi(): Promise<Category[]> {
  return dedupedFetch("categories_all", async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 60, tags: ["categories"] },
      ...(typeof window !== "undefined" ? { cache: "no-store" as RequestCache } : {}),
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const items = parseApiList<any>(payload);

    return items.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image:
        category.imageUrl ||
        category.image ||
        PLACEHOLDER_IMAGE,
      itemCount: category.itemCount ?? category._count?.productCategories ?? 0,
      description: category.description || "",
    }));
  });
}

export async function getDynamicFiltersApi() {
  return dedupedFetch("catalog_dynamic_filters", async () => {
    const response = await fetch(`${API_BASE_URL}/products/filters`, {
      next: { revalidate: 30, tags: ["filters", "products"] },
      ...(typeof window !== "undefined" ? { cache: "no-store" as RequestCache } : {}),
    });

    if (!response.ok) {
      return EMPTY_FILTERS;
    }

    const payload = await response.json();
    const data = (payload as { data?: typeof EMPTY_FILTERS }).data;
    return data || EMPTY_FILTERS;
  });
}

export type CatalogQuery = NonNullable<Parameters<typeof getProductsApi>[0]>;

export function buildCatalogQueryFromParams(params: Record<string, string | undefined>): CatalogQuery {
  const activeCategory = params.category || params.filter || "";
  const isOnSale = activeCategory === "on-sale";

  return {
    limit: 12,
    page: parseInt(params.page || "1", 10) || 1,
    sortBy: params.sort || "popular",
    category: activeCategory && !isOnSale ? activeCategory : undefined,
    onSale: isOnSale ? true : undefined,
    search: params.search || undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    colors: params.color ? [params.color] : undefined,
    sizes: params.size ? [params.size] : undefined,
    collection: params.collection || params.style || undefined,
  };
}

export function serializeCatalogQuery(query: CatalogQuery): string {
  return JSON.stringify({
    limit: query.limit ?? 12,
    page: query.page ?? 1,
    sortBy: query.sortBy ?? "popular",
    category: query.category,
    onSale: query.onSale,
    search: query.search,
    maxPrice: query.maxPrice,
    colors: query.colors,
    sizes: query.sizes,
    collection: query.collection,
    selectionMode: query.selectionMode,
    featured: query.featured,
  });
}
