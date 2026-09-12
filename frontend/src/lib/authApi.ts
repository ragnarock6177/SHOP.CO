const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface CheckUserPayload {
  email?: string;
  phone?: string;
  phoneNumber?: string;
  identifier?: string;
}

export interface CheckUserResponse {
  isRegistered: boolean;
  authProvider?: "EMAIL" | "PHONE" | "GOOGLE";
}

export interface SanitizedUser {
  id: string;
  firebaseUid: string | null;
  email: string | null;
  phone: string | null;
  phoneNumber?: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  authProvider?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roles: string[];
  permissions?: string[];
  isSuperAdmin?: boolean;
  role?: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: SanitizedUser;
  accessToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiErrorData {
  message?: string;
  error?: string;
}

export class ApiHttpError extends Error {
  status?: number;
  isNetworkError?: boolean;

  constructor(message: string, status?: number, isNetworkError?: boolean) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Sanitizes and converts backend/network error responses into clean, production-grade, human-friendly messages.
 */
function parseErrorMessage(data: ApiErrorData | null | undefined, fallbackMessage: string): string {
  const rawMsg = data?.message || data?.error;
  if (!rawMsg || typeof rawMsg !== "string") return fallbackMessage;

  // Clean up technical validation prefixes
  const cleanMsg = rawMsg
    .replace(/^Validation failed:\s*/i, "")
    .replace(/^(body|query|params)\./i, "")
    .replace(/^(identifier|email|password|phoneNumber|phone|firebaseToken):\s*/i, "");

  // Map to short, crisp app-style error messages
  if (/invalid credentials|invalid email or password/i.test(cleanMsg)) {
    return "Incorrect email or password";
  }
  if (/account already exists|email already in use|phone number already registered/i.test(cleanMsg)) {
    return "Account already exists. Please log in";
  }
  if (/user not found|no user found|no account found/i.test(cleanMsg)) {
    return "Account not found. Please sign up";
  }
  if (/account is disabled|suspended|forbidden/i.test(cleanMsg)) {
    return "Account suspended. Contact support";
  }
  if (/too many requests|rate limit/i.test(cleanMsg)) {
    return "Too many attempts. Try again later";
  }
  if (/jwt expired|token expired|unauthorized|session expired/i.test(cleanMsg)) {
    return "Session expired. Please log in again";
  }

  return cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
}

export async function checkUserApi(payload: CheckUserPayload): Promise<CheckUserResponse> {
  try {
    const requestBody: CheckUserPayload = {
      ...payload,
      phone: payload.phone || payload.phoneNumber,
    };

    const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data: ApiResponse<CheckUserResponse> = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from server",
    }));

    if (!response.ok || !data.success) {
      throw new ApiHttpError(
        parseErrorMessage(data, "Could not check account status. Please try again."),
        response.status,
      );
    }

    return data.data || { isRegistered: false };
  } catch (err: unknown) {
    if (err instanceof ApiHttpError) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
      throw new ApiHttpError("Unable to connect to server. Please check your internet connection.", undefined, true);
    }
    throw err;
  }
}

export async function loginApi(email: string, password: string): Promise<AuthResponseData> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "email", email, password }),
    });

    const data: ApiResponse<AuthResponseData> = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from server",
    }));

    if (!response.ok || !data.success) {
      throw new ApiHttpError(
        parseErrorMessage(data, "Invalid credentials. Please check your email and password."),
        response.status,
      );
    }

    return data.data!;
  } catch (err: unknown) {
    if (err instanceof ApiHttpError) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
      throw new ApiHttpError("Unable to connect to server. Please try again later.", undefined, true);
    }
    throw err;
  }
}

export async function registerEmailApi(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobileNumber?: string;
  firebaseToken?: string;
}): Promise<AuthResponseData> {
  try {
    const payload = {
      type: "email",
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || input.mobileNumber,
      ...(input.firebaseToken ? { firebaseToken: input.firebaseToken } : {}),
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<AuthResponseData> = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from server",
    }));

    if (!response.ok || !data.success) {
      throw new ApiHttpError(
        parseErrorMessage(data, "Failed to create account. Please try again."),
        response.status,
      );
    }

    return data.data!;
  } catch (err: unknown) {
    if (err instanceof ApiHttpError) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
      throw new ApiHttpError("Unable to connect to server. Please try again later.", undefined, true);
    }
    throw err;
  }
}

export async function registerFirebaseApi(
  type: "phone" | "google",
  firebaseToken: string
): Promise<AuthResponseData> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, firebaseToken }),
    });

    const data: ApiResponse<AuthResponseData> = await response.json().catch(() => ({
      success: false,
      message: "Invalid response from server",
    }));

    if (!response.ok || !data.success) {
      throw new ApiHttpError(
        parseErrorMessage(data, `Failed to authenticate with ${type}.`),
        response.status,
      );
    }

    return data.data!;
  } catch (err: unknown) {
    if (err instanceof ApiHttpError) {
      throw err;
    }
    if (err instanceof Error && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
      throw new ApiHttpError("Unable to connect to server. Please try again later.", undefined, true);
    }
    throw err;
  }
}

let inFlightMePromise: { token: string; promise: Promise<{ user: SanitizedUser }> } | null = null;

export async function getMeApi(token: string): Promise<{ user: SanitizedUser }> {
  // If a request with the exact same token is already pending, reuse that promise
  if (inFlightMePromise && inFlightMePromise.token === token) {
    return inFlightMePromise.promise;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: ApiResponse<SanitizedUser | { user: SanitizedUser }> = await response.json().catch(() => ({
        success: false,
        message: "Invalid response from server",
      }));

      if (!response.ok || !data.success) {
        throw new ApiHttpError(
          parseErrorMessage(data, "Session expired. Please log in again."),
          response.status,
        );
      }

      const rawData = data.data;
      const userObj = (rawData && typeof rawData === "object" && "user" in rawData
        ? (rawData as { user: SanitizedUser }).user
        : rawData) as SanitizedUser;

      return { user: userObj };
    } catch (err: unknown) {
      if (err instanceof ApiHttpError) {
        throw err;
      }
      if (err instanceof Error && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
        throw new ApiHttpError("Unable to connect to server.", undefined, true);
      }
      throw err;
    } finally {
      if (inFlightMePromise && inFlightMePromise.token === token) {
        inFlightMePromise = null;
      }
    }
  })();

  inFlightMePromise = { token, promise: fetchPromise };
  return fetchPromise;
}

export async function logoutApi(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: unknown) {
    console.error("Logout API error:", error);
  }
}
