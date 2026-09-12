import { PaymentService } from "../services/payment.service.js";
import crypto from "crypto";

export function testPaymentVerificationLogic() {
  const mockSecret = "test_secret_1234567890abcdef";
  const razorpayOrderId = "order_mock_12345";
  const razorpayPaymentId = "pay_mock_67890";
  const validSignature = crypto
    .createHmac("sha256", mockSecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const isValid = PaymentService.validateSignature(
    razorpayOrderId,
    razorpayPaymentId,
    validSignature,
    mockSecret
  );

  if (!isValid) {
    throw new Error("Payment signature verification failed for valid test vector");
  }

  const isInvalid = PaymentService.validateSignature(
    razorpayOrderId,
    razorpayPaymentId,
    "tampered_signature_string",
    mockSecret
  );

  if (isInvalid) {
    throw new Error("Payment signature verification incorrectly passed for tampered signature");
  }

  console.log("✔ Payment verification logic and signature contract unit tests passed");
}

testPaymentVerificationLogic();
