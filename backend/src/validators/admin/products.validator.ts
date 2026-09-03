import { z } from "zod";
import { ProductStatus, ProductVisibility } from "@prisma/client";

export const VariantInputSchema = z.object({
  id: z.string().uuid("Invalid variant ID").optional(),
  sku: z.string().min(1, "SKU is required"),
  colorName: z.string().min(1, "Color name is required"),
  colorHex: z.string().optional().nullable(),
  sizeName: z.string().min(1, "Size name is required"),
  price: z.number().nonnegative("Price must be non-negative"),
  compareAtPrice: z.number().nonnegative("Compare-at price must be non-negative").optional().nullable(),
  stock: z.number().int().nonnegative("Stock must be non-negative").optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const CreateProductSchema = z.object({
  body: z.object({
    id: z.string().uuid("Invalid product ID").optional(),
    name: z.string().min(1, "Product name is required"),
    slug: z.string().min(1, "Product slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    productType: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.DRAFT),
    visibility: z.nativeEnum(ProductVisibility).optional().default(ProductVisibility.PUBLIC),
    basePrice: z.number().nonnegative("Base price must be non-negative").optional(),
    compareAtPrice: z.number().nonnegative("Compare-at price must be non-negative").optional(),
    stockQuantity: z.number().int().nonnegative().optional().default(0),
    reorderLevel: z.number().int().nonnegative().optional().default(5),
    careInstructions: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    primaryCategoryId: z.string().uuid("Invalid primary category ID").optional(),
    collectionIds: z.array(z.string().uuid("Invalid collection ID")).optional(),
    images: z
      .array(
        z.object({
          imageUrl: z.string().url("Invalid image URL"),
          altText: z.string().optional(),
          sortOrder: z.number().int().optional(),
          isPrimary: z.boolean().optional(),
          variantIds: z.array(z.string().uuid()).optional(),
        })
      )
      .optional(),
    variants: z.array(VariantInputSchema).optional(),
  }),
});

export const UpdateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Product name is required").optional(),
    slug: z.string().min(1, "Product slug is required").optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    productType: z.string().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    visibility: z.nativeEnum(ProductVisibility).optional(),
    basePrice: z.number().nonnegative("Base price must be non-negative").optional(),
    compareAtPrice: z.number().nonnegative("Compare-at price must be non-negative").optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    careInstructions: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
    primaryCategoryId: z.string().uuid("Invalid primary category ID").optional(),
    collectionIds: z.array(z.string().uuid("Invalid collection ID")).optional(),
    variants: z.array(VariantInputSchema).optional(),
  }),
});

export const CreateVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
  }),
  body: VariantInputSchema,
});

export const UpdateVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID"),
    variantId: z.string().uuid("Invalid variant ID"),
  }),
  body: z.object({
    sku: z.string().min(1, "SKU is required").optional(),
    colorName: z.string().min(1, "Color name is required").optional(),
    colorHex: z.string().optional().nullable(),
    sizeName: z.string().min(1, "Size name is required").optional(),
    price: z.number().nonnegative("Price must be non-negative").optional(),
    compareAtPrice: z.number().nonnegative("Compare-at price must be non-negative").optional().nullable(),
    stock: z.number().int().nonnegative("Stock must be non-negative").optional(),
    isActive: z.boolean().optional(),
  }),
});

