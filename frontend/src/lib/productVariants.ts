import { CartItem, Product, ProductVariant } from "@/types/ecommerce";

export const LOW_STOCK_THRESHOLD = 5;

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

function isColorAttribute(attr: ProductVariant["attributes"][number]) {
  return attr.attributeSlug === "color" || attr.attributeName.toLowerCase() === "color";
}

function isSizeAttribute(attr: ProductVariant["attributes"][number]) {
  return attr.attributeSlug === "size" || attr.attributeName.toLowerCase() === "size";
}

/** Auto-resolve display/cart color: user pick → defaultColor → first available color. */
export function resolveProductColor(product: Product, userColor?: string): string | undefined {
  if (userColor) return userColor;
  if (product.defaultColor) return product.defaultColor;
  if (product.colors?.[0]?.name) return product.colors[0].name;
  return undefined;
}

export function productRequiresColor(product: Product): boolean {
  return (product.colors?.length ?? 0) > 0;
}

export function productRequiresSize(product: Product): boolean {
  if ((product.sizes?.length ?? 0) > 0) return true;

  if (product.variants?.length) {
    return product.variants.some((variant) =>
      variant.attributes.some((attr) => isSizeAttribute(attr)),
    );
  }

  return false;
}

/** Only size must be chosen manually before checkout. Color is auto-resolved. */
export function productRequiresVariantSelection(product: Product): boolean {
  return productRequiresSize(product);
}

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function getAvailableSizes(product: Product, colorName?: string): string[] {
  if (!product.variants?.length) {
    return sortSizes(product.sizes || []);
  }

  const sizes = new Set<string>();
  product.variants.forEach((variant) => {
    const colorAttr = variant.attributes.find((attr) => isColorAttribute(attr));
    const sizeAttr = variant.attributes.find((attr) => isSizeAttribute(attr));
    const matchesColor =
      !colorName ||
      !colorAttr ||
      colorAttr.value.toLowerCase() === colorName.toLowerCase();

    if (matchesColor && sizeAttr?.value) {
      sizes.add(sizeAttr.value);
    }
  });

  return sortSizes(sizes.size > 0 ? Array.from(sizes) : product.sizes || []);
}

export function getSizeStock(product: Product, size: string, colorName?: string): number {
  if (!product.variants?.length) {
    return product.stockAvailable ?? 0;
  }

  const variant = product.variants.find((item) =>
    variantMatchesSelection(item, colorName, size),
  );

  return variant?.stockAvailable ?? 0;
}

export function getCartItemMaxQuantity(item: CartItem): number {
  if (item.selectedSize) {
    return getSizeStock(item.product, item.selectedSize, item.selectedColor);
  }

  const variant = resolveVariant(item.product, item.selectedColor, item.selectedSize);
  if (variant) return variant.stockAvailable;

  return item.product.stockAvailable ?? 0;
}

function variantMatchesSelection(
  variant: ProductVariant,
  colorName?: string,
  sizeName?: string,
): boolean {
  const colorAttr = variant.attributes.find((attr) => isColorAttribute(attr));
  const sizeAttr = variant.attributes.find((attr) => isSizeAttribute(attr));

  if (colorName) {
    if (!colorAttr || colorAttr.value.toLowerCase() !== colorName.toLowerCase()) {
      return false;
    }
  }

  if (sizeName) {
    if (!sizeAttr || sizeAttr.value.toLowerCase() !== sizeName.toLowerCase()) {
      return false;
    }
  }

  return true;
}

export function resolveVariant(
  product: Product,
  colorName?: string,
  sizeName?: string,
): ProductVariant | null {
  if (!product.variants?.length) return null;

  const exact = product.variants.find((variant) =>
    variantMatchesSelection(variant, colorName, sizeName),
  );
  if (exact) return exact;

  // Size required but no exact match yet — do not fall back to another variant.
  if (sizeName) return null;

  if (colorName) {
    return (
      product.variants.find((variant) =>
        variantMatchesSelection(variant, colorName, undefined),
      ) || null
    );
  }

  if (product.variants.length === 1) return product.variants[0];
  return product.variants.find((variant) => variant.isDefault) || null;
}

export function getVariantStock(
  product: Product,
  colorName?: string,
  sizeName?: string,
): number {
  if (!product.variants?.length) {
    return product.stockAvailable ?? 0;
  }

  if (productRequiresSize(product) && !sizeName) {
    return 0;
  }

  const variant = resolveVariant(product, colorName, sizeName);
  if (variant) return variant.stockAvailable;

  if (sizeName) {
    return getSizeStock(product, sizeName, colorName);
  }

  return 0;
}

export function cartItemNeedsSize(item: CartItem): boolean {
  return productRequiresSize(item.product) && !item.selectedSize;
}

export function cartItemNeedsSelection(item: CartItem): boolean {
  return cartItemNeedsSize(item);
}

export function getCartItemsMissingSelection(cart: CartItem[]): number[] {
  return cart
    .map((item, index) => (cartItemNeedsSelection(item) ? index : -1))
    .filter((index) => index >= 0);
}

/** @deprecated Use getCartItemsMissingSelection */
export function getCartItemsMissingSize(cart: CartItem[]): number[] {
  return getCartItemsMissingSelection(cart);
}

export function getVariantPrice(product: Product, variant: ProductVariant | null): number {
  return variant?.price ?? product.price;
}
