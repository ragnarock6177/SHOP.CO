import { z, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/apiError.js";

const emailRegisterSchema = z.object({
  type: z.literal("email"),
  email: z.string().trim().email("Invalid email address format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
});

const phoneAuthSchema = z.object({
  type: z.literal("phone"),
  firebaseToken: z.string().trim().min(1, "Firebase ID token is required"),
});

const googleAuthSchema = z.object({
  type: z.literal("google"),
  firebaseToken: z.string().trim().min(1, "Firebase ID token is required"),
});

export const unifiedRegisterSchema = z.discriminatedUnion("type", [
  emailRegisterSchema,
  phoneAuthSchema,
  googleAuthSchema,
]);

export const emailLoginSchema = z.object({
  type: z.literal("email"),
  email: z.string().trim().email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
});

export const validateRegisterInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = unifiedRegisterSchema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e: ZodIssue) => e.message)
      .join(". ");
    return next(new BadRequestError(errorMessages));
  }
  req.body = result.data;
  next();
};

export const validateLoginInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = emailLoginSchema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e: ZodIssue) => e.message)
      .join(". ");
    return next(new BadRequestError(errorMessages));
  }
  req.body = result.data;
  next();
};

export const checkUserSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").optional(),
    phoneNumber: z.string().trim().min(1, "Please enter a valid mobile number").optional(),
    identifier: z.string().trim().min(1, "Please enter an email address or mobile number").optional(),
  })
  .refine(
    (data) => Boolean(data.email || data.phoneNumber || data.identifier),
    {
      message: "Please enter an email address or mobile number to check",
    }
  );

export const validateCheckUserInput = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const result = checkUserSchema.safeParse(req.body);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e: ZodIssue) => e.message)
      .join(". ");
    return next(new BadRequestError(errorMessages));
  }
  req.body = result.data;
  next();
};



