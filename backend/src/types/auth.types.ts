import { Role, UserStatus, AuthProvider } from "@prisma/client";

export type AuthType = "email" | "phone" | "google";

export interface EmailRegisterInput {
  type: "email";
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface EmailLoginInput {
  type: "email";
  email: string;
  password: string;
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
  EmailRegisterInput | PhoneAuthInput | GoogleAuthInput;

export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface SanitizedUser {
  id: string;
  firebaseUid: string | null;
  email: string | null;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  authProvider: AuthProvider;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: Role;
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
  phoneNumber?: string;
  identifier?: string;
}

export interface CheckUserResponseData {
  isRegistered: boolean;
  authProvider?: AuthProvider;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}



