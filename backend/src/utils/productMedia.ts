type VariantColorRef = {
  id: string;
  colorName?: string | null;
  attributes?: Array<{ attributeSlug?: string; attributeName?: string; value?: string }>;
};

type ProductImageRef = {
  imageUrl: string;
  altText?: string | null;
  variantIds?: string[];
  variantImages?: Array<{ variantId: string }>;
};

export function getVariantColorName(variant: VariantColorRef): string | null {
  if (variant.colorName) return variant.colorName;

  const colorAttr = variant.attributes?.find(
    (attr) =>
      attr.attributeSlug === "color" ||
      attr.attributeName?.toLowerCase() === "color",
  );

  return colorAttr?.value || null;
}

export function buildImagesByColor(
  images: ProductImageRef[],
  variants: VariantColorRef[],
): Record<string, string[]> {
  const colorVariantIds = new Map<string, string[]>();

  variants.forEach((variant) => {
    const color = getVariantColorName(variant);
    if (!color) return;

    const existing = colorVariantIds.get(color) || [];
    existing.push(variant.id);
    colorVariantIds.set(color, existing);
  });

  const result: Record<string, string[]> = {};

  colorVariantIds.forEach((variantIds, color) => {
    const colorImages = images
      .filter((img) => {
        const linkedVariantIds =
          img.variantIds || img.variantImages?.map((vi) => vi.variantId) || [];
        const isLinked = linkedVariantIds.some((id) => variantIds.includes(id));
        const altMatch = img.altText?.toLowerCase().includes(color.toLowerCase());
        return isLinked || altMatch;
      })
      .map((img) => img.imageUrl);

    if (colorImages.length > 0) {
      result[color] = colorImages;
    }
  });

  return result;
}

export function formatPublicImages(
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder: number;
    isPrimary: boolean;
    variantImages?: Array<{ variantId: string }>;
  }>,
) {
  return images.map((img) => ({
    id: img.id,
    imageUrl: img.imageUrl,
    altText: img.altText,
    sortOrder: img.sortOrder,
    isPrimary: img.isPrimary,
    variantIds: img.variantImages?.map((vi) => vi.variantId) || [],
  }));
}
