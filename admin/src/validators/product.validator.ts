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
  primaryCategoryId: z.string().uuid("Please select a primary category"),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"]),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type ProductFormInput = z.infer<typeof ProductFormSchema>;

