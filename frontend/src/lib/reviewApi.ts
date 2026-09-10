const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  "http://localhost:5000/api/v1";

export interface ProductReviewSummary {
  rating: number;
  reviewsCount: number;
}

export interface ProductReviewItem {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  comment?: string | null;
  customerName?: string;
  userName?: string;
  isVerifiedPurchase?: boolean;
  verified?: boolean;
  createdAt: string;
}

export interface ProductReviewsResponse {
  items: ProductReviewItem[];
  summary: ProductReviewSummary;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SubmitReviewInput {
  productId: string;
  rating: number;
  body: string;
  title?: string;
  variantId?: string;
}

function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function mapReviewToUi(review: ProductReviewItem) {
  return {
    id: review.id,
    userName: review.customerName || review.userName || "Customer",
    rating: review.rating,
    comment: review.body || review.comment || "",
    date: `Posted on ${formatReviewDate(review.createdAt)}`,
    verified: Boolean(review.isVerifiedPurchase ?? review.verified),
  };
}

export async function getProductReviewsApi(
  productId: string,
  page = 1,
  limit = 10,
  token?: string | null,
): Promise<ProductReviewsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/products/${productId}/reviews?${params.toString()}`,
    { cache: "no-store", headers },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || "Failed to load reviews");
  }

  const data = payload.data as ProductReviewsResponse;
  return {
    items: data?.items ?? [],
    summary: data?.summary ?? { rating: 0, reviewsCount: 0 },
    meta: data?.meta ?? {
      page: 1,
      limit,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function submitProductReviewApi(
  token: string,
  input: SubmitReviewInput,
): Promise<{ message: string; review: ProductReviewItem }> {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error?.message || "Failed to submit review");
  }

  const review = (payload?.data ?? {}) as ProductReviewItem;

  return {
    message: payload?.message || "Review submitted successfully",
    review,
  };
}
