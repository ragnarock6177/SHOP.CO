const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface BackendWishlistItem {
  productId: string;
  name: string;
  slug: string;
  basePrice: number | null;
  imageUrl: string | null;
  addedAt: string;
}

export interface BackendWishlist {
  id: string;
  name: string;
  items: BackendWishlistItem[];
}

export async function getWishlistApi(token: string): Promise<BackendWishlist | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      return null;
    }
    return data.data;
  } catch (err: unknown) {
    console.error("Failed to fetch user wishlist:", err);
    return null;
  }
}

export async function addWishlistItemApi(token: string, productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/wishlist/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to add wishlist item");
  }
}

export async function removeWishlistItemApi(token: string, productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/wishlist/items/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.message || "Failed to remove wishlist item");
  }
}

export async function syncLocalWishlistToServer(
  token: string,
  productIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];
  await Promise.allSettled(uniqueIds.map((productId) => addWishlistItemApi(token, productId)));
}
