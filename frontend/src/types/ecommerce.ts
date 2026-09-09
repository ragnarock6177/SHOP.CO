export interface ProductVariant {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stockAvailable: number;
  isDefault?: boolean;
  attributes: {
    attributeSlug: string;
    attributeName: string;
    valueSlug: string;
    value: string;
    colorHex?: string;
  }[];
}

export interface ProductImageMeta {
  id?: string;
  url: string;
  altText?: string | null;
  variantIds?: string[];
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  category: string;
  image: string;
  images: string[];
  allImages?: ProductImageMeta[];
  imagesByColor?: Record<string, string[]>;
  defaultColor?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tags?: string[];
  inStock: boolean;
  stockAvailable?: number;
  variants?: ProductVariant[];
  featured?: boolean;
  isNew?: boolean;
  careInstructions?: string;
  specs?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  variantId?: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  minRating: number;
  sortBy: "featured" | "price-low" | "price-high" | "rating" | "newest";
  searchQuery: string;
  inStockOnly: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  bgGradient: string;
}
