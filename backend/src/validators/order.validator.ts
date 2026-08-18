import { z } from "zod";

export const AddressInputSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().max(255).optional(),
  landmark: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  countryCode: z.string().length(2).default("IN"),
  phone: z.string().max(30).optional(),
});

export const CreateOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          variantId: z.string().uuid("Invalid variant ID"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        })
      )
      .min(1, "Order must contain at least one item"),
    shippingAddress: AddressInputSchema,
    billingAddress: AddressInputSchema.optional(),
    couponCode: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const OrderNumberParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1),
  }),
});
