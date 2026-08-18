import { z } from "zod";
import { OrderStatus, InventoryMovementType } from "@prisma/client";

export const CreateAdminProductSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    basePrice: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.string().length(3).default("INR"),
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).default("ACTIVE"),
    categoryIds: z.array(z.string().uuid()).min(1),
    collectionIds: z.array(z.string().uuid()).optional(),
  }),
});

export const UpdateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    reason: z.string().optional(),
  }),
});

export const AdjustInventorySchema = z.object({
  params: z.object({
    variantId: z.string().uuid("Invalid variant ID"),
  }),
  body: z.object({
    quantityChange: z.number().int(),
    movementType: z.nativeEnum(InventoryMovementType).default(InventoryMovementType.ADJUSTMENT),
    notes: z.string().optional(),
  }),
});
