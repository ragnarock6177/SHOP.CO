import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";
export const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export const razorpay = new Razorpay({
  key_id: razorpayKeyId || "rzp_test_placeholder",
  key_secret: razorpayKeySecret || "secret_placeholder",
});
