import crypto from "crypto";
import { PaymentService } from "../services/payment.service.js";

export function testSignatureVerification() {
  const secret = "test_secret_key_12345";
  const orderId = "order_EKfA98SbR28pwt";
  const paymentId = "pay_29QQoUBcxrhLEZ";

  // Expected HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = PaymentService.validateSignature(orderId, paymentId, expectedSignature, secret);
  if (!isValid) {
    throw new Error("Valid signature failed verification");
  }

  const isInvalid = PaymentService.validateSignature(orderId, paymentId, "tampered_signature_hex", secret);
  if (isInvalid) {
    throw new Error("Invalid signature incorrectly passed verification");
  }

  console.log("✔ Payment signature verification unit test passed");
}

testSignatureVerification();

