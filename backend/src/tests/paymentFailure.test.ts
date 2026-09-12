import { PaymentService } from "../services/payment.service.js";

export function testPaymentFailureAndRetryContracts() {
  if (typeof PaymentService.retryRazorpayPayment !== "function") {
    throw new Error("PaymentService.retryRazorpayPayment must be defined for customer retry");
  }
  console.log("✔ Payment failure and retry contract interface tests passed");
}

testPaymentFailureAndRetryContracts();
