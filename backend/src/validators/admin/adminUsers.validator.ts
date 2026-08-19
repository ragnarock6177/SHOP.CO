import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const CreateAdminUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional().default(UserStatus.ACTIVE),
    roleIds: z.array(z.string().uuid("Invalid role ID")).optional().default([]),
  }),
});

export const UpdateAdminUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    email: z.string().email("Invalid email address").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    status: z.nativeEnum(UserStatus).optional(),
    roleIds: z.array(z.string().uuid("Invalid role ID")).optional(),
  }),
});

export const UpdateAdminUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus, { message: "User status is required" }),
  }),
});
