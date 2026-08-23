import { z } from "zod";
import { ProductStatus, ProductVisibility } from "@prisma/client";

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
    careInstructions: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
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
    careInstructions: z.string().optional(),
    categoryId: z.string().uuid("Invalid category ID").optional(),
  }),
});
