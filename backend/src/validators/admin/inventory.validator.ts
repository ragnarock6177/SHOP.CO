import { z } from "zod";
import { InventoryMovementType } from "@prisma/client";

export const AdjustInventorySchema = z.object({
  body: z.object({
    variantId: z.string().uuid("Invalid variant ID"),
    quantityChange: z.number().int("Quantity change must be an integer"),
    movementType: z.nativeEnum(InventoryMovementType, { message: "Invalid movement type" }),
    notes: z.string().optional(),
  }),
});

export const UpdateThresholdSchema = z.object({
  params: z.object({
    variantId: z.string().uuid("Invalid variant ID"),
  }),
  body: z.object({
    reorderLevel: z.number().int().min(0, "Reorder level must be non-negative"),
  }),
});
