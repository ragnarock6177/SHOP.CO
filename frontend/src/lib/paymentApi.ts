import { VerifyPaymentPayload, VerifyPaymentResponse } from "@/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function verifyPaymentApi(
  payload: VerifyPaymentPayload,
  token?: string
): Promise<VerifyPaymentResponse> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Payment verification failed.");
    }

    return data.data as VerifyPaymentResponse;
  } catch (err: any) {
    if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server for payment verification.");
    }
    throw err;
  }
}

export async function retryPaymentApi(
  orderNumber: string,
  token?: string
): Promise<{ orderNumber: string; razorpay: any }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/payments/${encodeURIComponent(orderNumber)}/retry`, {
      method: "POST",
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Failed to retry payment.");
    }

    return data.data;
  } catch (err: any) {
    if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Unable to connect to server to retry payment.");
    }
    throw err;
  }
}
