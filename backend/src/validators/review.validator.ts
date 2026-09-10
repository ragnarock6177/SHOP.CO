import { z } from "zod";

export const CreateReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    variantId: z.string().uuid().optional(),
    orderItemId: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(255).optional(),
    body: z.string().min(3, "Review must be at least 3 characters").max(5000),
  }),
});

export const ProductIdParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid("Invalid product ID format"),
  }),
});

export const ProductReviewsListSchema = z.object({
  params: z.object({
    productId: z.string().uuid("Invalid product ID format"),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});
