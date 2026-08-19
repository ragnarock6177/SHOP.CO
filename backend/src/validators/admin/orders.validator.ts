import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const UpdateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID"),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus, { message: "Invalid target order status" }),
    notes: z.string().optional(),
  }),
});
