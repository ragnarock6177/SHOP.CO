export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayOrderPayload {
  keyId: string;
  orderId: string;
  amount: number; // In paise (e.g., 284900)
  currency: string; // e.g. "INR"
  name: string;
  description?: string;
  prefill?: RazorpayPrefill;
}

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  prefill?: RazorpayPrefill;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface VerifyPaymentPayload {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  transactionId: string;
  invoiceNumber?: string;
}
