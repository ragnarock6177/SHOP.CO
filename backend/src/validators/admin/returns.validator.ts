import { z } from "zod";
import { ReturnStatus } from "@prisma/client";

export const UpdateReturnStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid return request ID"),
  }),
  body: z.object({
    status: z.nativeEnum(ReturnStatus, { message: "Invalid return status" }),
    adminNotes: z.string().optional(),
  }),
});

export const ProcessRefundSchema = z.object({
  body: z.object({
    orderId: z.string().uuid("Invalid order ID"),
    returnId: z.string().uuid("Invalid return ID").optional(),
    paymentId: z.string().uuid("Invalid payment ID").optional(),
    amount: z.number().positive("Refund amount must be greater than zero"),
    reason: z.string().min(1, "Refund reason is required"),
  }),
});
