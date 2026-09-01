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
  email: z.string().email().optional(),
});

export const ItemInputSchema = z.object({
  id: z.string().optional(),
  variantId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  selectedColor: z.string().optional(),
  selectedSize: z.string().optional(),
  unitPrice: z.number().optional(),
  title: z.string().optional(),
  image: z.string().optional(),
});

export const CheckoutSummarySchema = z.object({
  body: z.object({
    items: z
      .array(ItemInputSchema)
      .min(1, "Checkout requires at least one item"),
    couponId: z.string().optional(),
    couponCode: z.string().optional(),
    shippingSpeed: z.enum(["STANDARD", "EXPRESS"]).optional().default("STANDARD"),
    shippingAddress: z
      .object({
        postalCode: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        countryCode: z.string().optional(),
      })
      .optional(),
  }),
});

export const CreateOrderSchema = z.object({
  body: z.object({
    items: z
      .array(ItemInputSchema)
      .min(1, "Order must contain at least one item"),
    shippingAddress: AddressInputSchema,
    billingAddress: AddressInputSchema.optional(),
    couponId: z.string().optional(),
    couponCode: z.string().optional(),
    shippingSpeed: z.enum(["STANDARD", "EXPRESS"]).optional().default("STANDARD"),
    paymentMethod: z.string().optional().default("COD"),
    notes: z.string().optional(),
  }),
});

export const OrderNumberParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1),
  }),
});
