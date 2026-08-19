import { z } from "zod";
import { DiscountType } from "@prisma/client";

export const CreateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3, "Coupon code must be at least 3 characters"),
    description: z.string().optional(),
    discountType: z.nativeEnum(DiscountType, { message: "Invalid discount type" }),
    discountValue: z.number().positive("Discount value must be positive"),
    minimumOrderAmount: z.number().nonnegative().optional(),
    maximumDiscountAmount: z.number().nonnegative().optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().optional().default(1),
    startsAt: z.string().or(z.date()).optional(),
    expiresAt: z.string().or(z.date()).optional(),
    isActive: z.boolean().optional().default(true),
  }),
});

export const UpdateCouponSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid coupon ID"),
  }),
  body: z.object({
    description: z.string().optional(),
    discountType: z.nativeEnum(DiscountType).optional(),
    discountValue: z.number().positive().optional(),
    minimumOrderAmount: z.number().nonnegative().optional(),
    maximumDiscountAmount: z.number().nonnegative().optional(),
    usageLimit: z.number().int().positive().optional(),
    usageLimitPerUser: z.number().int().positive().optional(),
    startsAt: z.string().or(z.date()).optional(),
    expiresAt: z.string().or(z.date()).optional(),
    isActive: z.boolean().optional(),
  }),
});
