import { AuthSessionError } from "@/lib/authSession";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000/api/v1";

export interface UserProfile {
  id: string;
  firebaseUid: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  profileImage: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  smsDeliveryUpdates: boolean;
  promotionalEmails: boolean;
  orderEmailUpdates: boolean;
  hasPassword: boolean;
  status: string;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: string[];
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  dateOfBirth?: string | null;
  smsDeliveryUpdates?: boolean;
  promotionalEmails?: boolean;
  orderEmailUpdates?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

function parseApiError(payload: any, fallback: string): string {
  return payload?.message || payload?.error?.message || fallback;
}

async function readApiError(response: Response, fallback: string): Promise<AuthSessionError> {
  const payload = await response.json().catch(() => ({}));
  return new AuthSessionError(parseApiError(payload, fallback), response.status);
}

export async function getUserProfileApi(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await readApiError(response, "Failed to load profile");
  }

  const payload = await response.json().catch(() => ({}));
  return payload.data as UserProfile;
}

export async function updateUserProfileApi(
  token: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(parseApiError(payload, "Failed to update profile"));
  }

  return payload.data as UserProfile;
}

export async function changePasswordApi(
  token: string,
  input: ChangePasswordInput,
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(parseApiError(payload, "Failed to update password"));
  }

  return {
    message: payload?.message || payload?.data?.message || "Password updated successfully",
  };
}

export function mapProfileToAuthUser(profile: UserProfile) {
  return {
    id: profile.id,
    firebaseUid: profile.firebaseUid,
    email: profile.email,
    phone: profile.phone,
    phoneNumber: profile.phone,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImage: profile.profileImage,
    isEmailVerified: Boolean(profile.emailVerifiedAt),
    isPhoneVerified: Boolean(profile.phoneVerifiedAt),
    roles: profile.roles ?? ["CUSTOMER"],
    status: profile.status,
    lastLoginAt: null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
