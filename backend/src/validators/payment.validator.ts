import { z } from "zod";

export const VerifyPaymentSchema = z.object({
  body: z.object({
    orderNumber: z.string().min(1, "Order number is required"),
    razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
    razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
    razorpaySignature: z.string().min(1, "Razorpay signature is required"),
  }),
});

export const RefundPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Refund amount must be positive").optional(),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const OrderNumberParamSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1, "Order number is required"),
  }),
});
