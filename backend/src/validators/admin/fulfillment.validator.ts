import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";

export const CreateShipmentSchema = z.object({
  body: z.object({
    orderId: z.string().uuid("Invalid order ID"),
    carrier: z.string().min(1, "Carrier is required"),
    trackingNumber: z.string().min(1, "Tracking number is required"),
    trackingUrl: z.string().url("Invalid tracking URL").optional().or(z.literal("")).nullable(),
    notes: z.string().optional().nullable(),
    items: z
      .array(
        z.object({
          orderItemId: z.string().uuid("Invalid order item ID"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        })
      )
      .optional()
      .nullable(),
  }),
});

export const UpdateShipmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shipment ID"),
  }),
  body: z.object({
    status: z.nativeEnum(ShipmentStatus, { message: "Invalid shipment status" }),
  }),
});
