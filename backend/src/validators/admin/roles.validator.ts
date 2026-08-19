import { z } from "zod";

export const CreateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid("Invalid permission ID")).optional().default([]),
  }),
});

export const UpdateRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid role ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Role name is required").optional(),
    description: z.string().optional(),
    permissionIds: z.array(z.string().uuid("Invalid permission ID")).optional(),
  }),
});
