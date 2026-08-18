import { UserStatus } from "@prisma/client";

export type AuthType = "email" | "phone" | "google";

export interface EmailRegisterInput {
  type: "email";
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface PhoneAuthInput {
  type: "phone";
  firebaseToken: string;
}

export interface GoogleAuthInput {
  type: "google";
  firebaseToken: string;
}

export type UnifiedRegisterInput =
  | EmailRegisterInput
  | PhoneAuthInput
  | GoogleAuthInput;

export interface EmailLoginInput {
  type?: "email";
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

export interface SanitizedUser {
  id: string;
  firebaseUid: string | null;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roles: string[];
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseData {
  user: SanitizedUser;
  accessToken: string;
}

export interface CheckUserInput {
  email?: string;
  phone?: string;
  phoneNumber?: string;
  identifier?: string;
}

export interface CheckUserResponseData {
  isRegistered: boolean;
  authProvider?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
