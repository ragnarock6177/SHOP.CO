import { dedupedFetch } from "@/lib/fetchCache";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface CheckoutItemPayload {
  id?: string;
  variantId?: string;
  productId?: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  unitPrice?: number;
  title?: string;
  image?: string;
}

export interface CheckoutSummaryPayload {
  items: CheckoutItemPayload[];
  couponId?: string;
  couponCode?: string;
  shippingSpeed?: "STANDARD" | "EXPRESS";
  shippingAddress?: {
    postalCode?: string;
    state?: string;
    city?: string;
    countryCode?: string;
  };
}

export interface HydratedCheckoutItem {
  variantId: string;
  productId: string;
  title: string;
  variantName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  inStock: boolean;
  availableStock: number;
}

export interface CouponSummary {
  code: string;
  applied: boolean;
  discountAmount: number;
  message: string;
}

export interface ShippingSummary {
  speed: "STANDARD" | "EXPRESS";
  amount: number;
  isFree: boolean;
  freeShippingThreshold: number;
}

export interface CheckoutSummaryData {
  items: HydratedCheckoutItem[];
  subtotal: number;
  coupon: CouponSummary | null;
  shipping: ShippingSummary;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface CreateOrderPayload {
  items: CheckoutItemPayload[];
  shippingAddress: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    address?: string;
    city: string;
    state: string;
    postalCode?: string;
    zip?: string;
    countryCode?: string;
  };
  billingAddress?: any;
  couponId?: string;
  couponCode?: string;
  shippingSpeed?: "STANDARD" | "EXPRESS";
  paymentMethod?: string;
  notes?: string;
}

export interface OrderDetailItem {
  id: string;
  variantId?: string;
  sku?: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  image?: string;
}

export interface OrderDetailAddress {
  id: string;
  type: "SHIPPING" | "BILLING";
  firstName: string;
  lastName?: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
}

export interface OrderDetailData {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  placedAt: string;
  createdAt: string;
  items: OrderDetailItem[];
  addresses: OrderDetailAddress[];
  payments?: any[];
  statusHistory?: any[];
  shipments?: any[];
}

export async function getCheckoutSummaryApi(
  payload: CheckoutSummaryPayload
): Promise<CheckoutSummaryData> {
  const cacheKey = `checkout_summary_${JSON.stringify(payload)}`;
  return dedupedFetch(cacheKey, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/checkout/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to calculate checkout summary.");
      }

      return data.data as CheckoutSummaryData;
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        throw new Error("Unable to connect to server for checkout calculations.");
      }
      throw err;
    }
  }, 1500);
}

export async function placeOrderApi(
  payload: CreateOrderPayload,
  token?: string
): Promise<OrderDetailData> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || "Failed to place order.");
    }

    return data.data as OrderDetailData;
  } catch (err: any) {
    if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
      throw new Error("Server unreachable. Please check your connection and try again.");
    }
    throw err;
  }
}

export async function getOrderByNumberApi(
  orderNumber: string,
  token?: string
): Promise<OrderDetailData> {
  const cacheKey = `order_details_${orderNumber}_${token || "guest"}`;
  return dedupedFetch(cacheKey, async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Order not found.");
      }

      return data.data as OrderDetailData;
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        throw new Error("Unable to fetch order details.");
      }
      throw err;
    }
  }, 3000);
}

export async function getUserOrdersApi(
  page: number = 1,
  limit: number = 10,
  token?: string
): Promise<{ data: OrderDetailData[]; meta: any }> {
  const cacheKey = `user_orders_${page}_${limit}_${token || "guest"}`;
  return dedupedFetch(cacheKey, async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=${limit}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to load orders.");
      }

      return { data: data.data || [], meta: data.meta };
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        throw new Error("Unable to fetch orders list.");
      }
      throw err;
    }
  }, 3000);
}
