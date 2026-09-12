const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface BackendCartItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
  imageUrl: string | null;
}

export interface BackendCart {
  id: string;
  userId?: string | null;
  guestToken?: string | null;
  status: string;
  subtotal: number;
  totalQuantity: number;
  items: BackendCartItem[];
}

export interface CartApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function getAuthHeaders(token?: string | null, guestToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (guestToken) {
    headers["x-guest-token"] = guestToken;
  }
  return headers;
}

export async function getCartApi(
  token?: string | null,
  guestToken?: string | null
): Promise<BackendCart | null> {
  if (!token && !guestToken) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      method: "GET",
      headers: getAuthHeaders(token, guestToken),
    });
    const data: CartApiResponse<BackendCart> = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return null;
    return data.data;
  } catch (err: unknown) {
    console.error("Failed to fetch cart:", err);
    return null;
  }
}

export async function addCartItemApi(
  payload: { variantId: string; quantity: number },
  token?: string | null,
  guestToken?: string | null
): Promise<BackendCart | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: getAuthHeaders(token, guestToken),
      body: JSON.stringify(payload),
    });
    const data: CartApiResponse<BackendCart> = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      console.warn("Add cart item API failed:", data?.message);
      return null;
    }
    return data.data;
  } catch (err: unknown) {
    console.error("Add cart item error:", err);
    return null;
  }
}

export async function updateCartItemApi(
  cartItemId: string,
  quantity: number,
  token?: string | null,
  guestToken?: string | null
): Promise<BackendCart | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: "PATCH",
      headers: getAuthHeaders(token, guestToken),
      body: JSON.stringify({ quantity }),
    });
    const data: CartApiResponse<BackendCart> = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return null;
    return data.data;
  } catch (err: unknown) {
    console.error("Update cart item error:", err);
    return null;
  }
}

export async function removeCartItemApi(
  cartItemId: string,
  token?: string | null,
  guestToken?: string | null
): Promise<BackendCart | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(token, guestToken),
    });
    const data: CartApiResponse<BackendCart> = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return null;
    return data.data;
  } catch (err: unknown) {
    console.error("Remove cart item error:", err);
    return null;
  }
}

export async function mergeCartApi(guestToken: string, token: string): Promise<BackendCart | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cart/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ guestToken }),
    });
    const data: CartApiResponse<BackendCart> = await res.json().catch(() => null);
    if (!res.ok || !data?.success) return null;
    return data.data;
  } catch (err: unknown) {
    console.error("Merge cart error:", err);
    return null;
  }
}
