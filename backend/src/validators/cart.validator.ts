import { z } from "zod";

export const AddCartItemSchema = z.object({
  body: z.object({
    variantId: z.string().uuid("Invalid variant ID format"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const UpdateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid cart item ID format"),
  }),
  body: z.object({
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
  }),
});

export const MergeCartSchema = z.object({
  body: z.object({
    guestToken: z.string().uuid("Invalid guest token format"),
  }),
});
