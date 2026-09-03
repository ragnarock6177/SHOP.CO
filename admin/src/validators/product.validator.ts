import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  productType: z.string().optional(),
  basePrice: z.number().positive("Base price must be greater than 0"),
  comparePrice: z.number().optional(),
  stockQuantity: z.number().int("Stock must be a whole number").nonnegative("Stock cannot be negative").optional(),
  reorderLevel: z.number().int().nonnegative().optional(),
  primaryCategoryId: z.string().uuid("Please select a primary category"),
  collectionIds: z.array(z.string().uuid()).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  variants: z.array(z.any()).optional(),
});

export interface ProductVariantInput {
  id?: string;
  sku: string;
  colorName: string;
  colorHex?: string | null;
  sizeName: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isActive?: boolean;
}

export type ProductFormInput = z.infer<typeof ProductFormSchema>;


