import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid staff email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
