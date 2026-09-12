import type { UserAddress } from "@/types/address";
import type { AddressFormValues } from "@/types/address";
import { formValuesToAddressPayload } from "@/types/address";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response, fallback: string): Promise<T> {
  const data: ApiResponse<T> = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || fallback);
  }
  return data.data as T;
}

export async function getUserAddressesApi(token: string): Promise<UserAddress[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/addresses`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parseResponse<UserAddress[]>(response, "Failed to load saved addresses.");
}

export async function addUserAddressApi(
  token: string,
  values: AddressFormValues,
): Promise<UserAddress> {
  const response = await fetch(`${API_BASE_URL}/users/me/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(formValuesToAddressPayload(values)),
  });
  return parseResponse<UserAddress>(response, "Failed to save address.");
}

export async function updateUserAddressApi(
  token: string,
  addressId: string,
  values: AddressFormValues,
): Promise<UserAddress> {
  const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(formValuesToAddressPayload(values)),
  });
  return parseResponse<UserAddress>(response, "Failed to update address.");
}

export async function setDefaultAddressApi(
  token: string,
  addressId: string,
): Promise<UserAddress> {
  const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}/default`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return parseResponse<UserAddress>(response, "Failed to update default address.");
}

export async function deleteUserAddressApi(token: string, addressId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseResponse<null>(response, "Failed to delete address.");
}
