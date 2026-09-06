const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
    throw new Error(data?.message || "Failed to sync wishlist item");
  }
}

export async function syncLocalWishlistToServer(
  token: string,
  productIds: string[],
): Promise<void> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];
  await Promise.allSettled(uniqueIds.map((productId) => addWishlistItemApi(token, productId)));
}
