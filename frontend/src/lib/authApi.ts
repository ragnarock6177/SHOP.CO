const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface CheckUserPayload {
  email?: string;
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
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  authProvider: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: SanitizedUser;
  accessToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Sanitizes and extracts a human-readable error message from backend or network errors.
 */
function parseErrorMessage(data: any, fallbackMessage: string): string {
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return fallbackMessage;
}

export async function checkUserApi(payload: CheckUserPayload): Promise<CheckUserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: ApiResponse<CheckUserResponse> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(parseErrorMessage(data, "Could not check account status. Please try again."));
    }

    return data.data || { isRegistered: false };
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server. Please check your internet connection.");
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

    const data: ApiResponse<AuthResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(parseErrorMessage(data, "Invalid credentials. Please check your email and password."));
    }

    return data.data!;
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server. Please try again later.");
    }
    throw err;
  }
}

export async function registerEmailApi(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponseData> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "email", ...input }),
    });

    const data: ApiResponse<AuthResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(parseErrorMessage(data, "Failed to create account. Please try again."));
    }

    return data.data!;
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server. Please try again later.");
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

    const data: ApiResponse<AuthResponseData> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(parseErrorMessage(data, `Failed to authenticate with ${type}.`));
    }

    return data.data!;
  } catch (err: any) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server. Please try again later.");
    }
    throw err;
  }
}



export async function getMeApi(token: string): Promise<{ user: SanitizedUser }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data: ApiResponse<{ user: SanitizedUser }> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(parseErrorMessage(data, "Session expired. Please log in again."));
  }

  return data.data!;
}

export async function logoutApi(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Logout API error:", error);
  }
}
