import { z } from "zod";
import { AddressType } from "@prisma/client";

export const UpdateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
    profileImage: z.string().url().optional(),
  }),
});

export const CreateAddressSchema = z.object({
  body: z.object({
    type: z.nativeEnum(AddressType).default(AddressType.SHIPPING),
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
    isDefault: z.boolean().default(false),
  }),
});

export const IdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid UUID format"),
  }),
});
