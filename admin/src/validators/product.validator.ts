import { z } from "zod";

export const ProductFormSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  careInstructions: z.string().optional(),
  basePrice: z.number().positive("Base price must be greater than 0"),
  comparePrice: z.number().optional(),
  primaryCategoryId: z.string().uuid("Please select a primary category"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]),
});

export type ProductFormInput = z.infer<typeof ProductFormSchema>;
