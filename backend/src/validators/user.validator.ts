import { z } from "zod";
import { AddressType } from "@prisma/client";

export const AddressLabelSchema = z.enum(["Home", "Work", "Other"]);

export const AddressFieldsSchema = z.object({
  type: z.nativeEnum(AddressType).default(AddressType.SHIPPING),
  label: AddressLabelSchema.default("Home"),
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
});

const optionalPhoneSchema = z
  .string()
  .max(30)
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const UpdateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().max(100).optional().nullable(),
    phone: optionalPhoneSchema,
    profileImage: z.string().url().optional().nullable(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
      .optional()
      .nullable(),
    smsDeliveryUpdates: z.boolean().optional(),
    promotionalEmails: z.boolean().optional(),
    orderEmailUpdates: z.boolean().optional(),
  }),
});

export const ChangePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password is too long"),
  }),
});

export const CreateAddressSchema = z.object({
  body: AddressFieldsSchema,
});

export const UpdateAddressSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid UUID format"),
  }),
  body: AddressFieldsSchema.partial(),
});

export const IdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid UUID format"),
  }),
});
