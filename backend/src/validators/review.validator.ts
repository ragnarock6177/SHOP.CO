import { z } from "zod";

export const CreateReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    variantId: z.string().uuid().optional(),
    orderItemId: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(255).optional(),
    body: z.string().optional(),
  }),
});

export const ProductIdParamSchema = z.object({
  params: z.object({
    productId: z.string().uuid("Invalid product ID format"),
  }),
});
