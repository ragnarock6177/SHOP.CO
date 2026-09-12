import Razorpay from "razorpay";
import { env } from "./env.js";

export const razorpayKeyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
export const razorpayKeySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayWebhookSecret = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || "";

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayInstance) {
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.warn("⚠️ Razorpay credentials not configured in environment. Using test placeholder.");
    }
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId || "rzp_test_placeholder",
      key_secret: razorpayKeySecret || "secret_placeholder",
    });
  }
  return razorpayInstance;
}
