import { Prisma } from "@prisma/client";
import { getAvailableStock } from "./inventory.utils.js";

export const VARIANT_RESOLVE_INCLUDE = {
  product: {
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" as const } },
    },
  },
  inventory: true,
  variantAttributeValues: {
    include: {
      attributeValue: { include: { attribute: true } },
    },
  },
} satisfies Prisma.ProductVariantInclude;

export type ResolvedVariant = Prisma.ProductVariantGetPayload<{
  include: typeof VARIANT_RESOLVE_INCLUDE;
}>;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function getVariantColorName(variant: ResolvedVariant): string | null {
  const colorVal = variant.variantAttributeValues.find(
    (vav) =>
      vav.attributeValue.attribute?.slug === "color" ||
      Boolean(vav.attributeValue.colorHex)
  )?.attributeValue;
  return colorVal?.value || null;
}

export function getVariantSizeName(variant: ResolvedVariant): string | null {
  const sizeVal = variant.variantAttributeValues.find(
    (vav) => vav.attributeValue.attribute?.slug === "size"
  )?.attributeValue;
  return sizeVal?.value || null;
}

function variantMatchesSelection(
  variant: ResolvedVariant,
  selectedColor?: string,
  selectedSize?: string
): boolean {
  const color = getVariantColorName(variant);
  const size = getVariantSizeName(variant);

  if (selectedColor) {
    if (!color || normalize(color) !== normalize(selectedColor)) return false;
  }
  if (selectedSize) {
    if (!size || normalize(size) !== normalize(selectedSize)) return false;
  }

  return true;
}

export function findMatchingVariant(
  variants: ResolvedVariant[],
  selectedColor?: string,
  selectedSize?: string
): ResolvedVariant | null {
  if (!variants.length) return null;

  if (selectedColor || selectedSize) {
    const match = variants.find((variant) =>
      variantMatchesSelection(variant, selectedColor, selectedSize)
    );
    return match || null;
  }

  if (variants.length === 1) return variants[0];
  return variants.find((variant) => variant.isDefault) || variants[0];
}

export function buildVariantDisplayName(
  variant: ResolvedVariant | null,
  selectedColor?: string,
  selectedSize?: string
): string {
  if (variant?.variantName) return variant.variantName;

  const color = selectedColor || (variant ? getVariantColorName(variant) : null);
  const size = selectedSize || (variant ? getVariantSizeName(variant) : null);

  if (color && size) return `${color} / ${size}`;
  if (color) return color;
  if (size) return size;
  return "Standard";
}

export function getVariantAvailableStock(variant: ResolvedVariant | null): number {
  if (!variant) return 0;
  return getAvailableStock(variant.inventory);
}

export interface LineItemInput {
  id?: string;
  variantId?: string;
  productId?: string;
  selectedColor?: string;
  selectedSize?: string;
}

type DbClient = {
  productVariant: { findFirst: (args: any) => Promise<any> };
  product: { findFirst: (args: any) => Promise<any> };
};

export async function resolveLineItemVariant(
  db: DbClient,
  item: LineItemInput
): Promise<{ variant: ResolvedVariant | null; product: any | null }> {
  const targetId = item.variantId || item.id || item.productId;
  let variant: ResolvedVariant | null = null;
  let product: any = null;

  if (!targetId) {
    return { variant: null, product: null };
  }

  variant = await db.productVariant.findFirst({
    where: { id: targetId, isActive: true, deletedAt: null },
    include: VARIANT_RESOLVE_INCLUDE,
  });

  if (!variant) {
    product = await db.product.findFirst({
      where: { id: targetId, status: "ACTIVE", deletedAt: null },
      include: {
        variants: {
          where: { isActive: true, deletedAt: null },
          include: VARIANT_RESOLVE_INCLUDE,
        },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    if (product?.variants?.length) {
      variant = findMatchingVariant(
        product.variants as ResolvedVariant[],
        item.selectedColor,
        item.selectedSize
      );
    }
  }

  return { variant, product };
}
