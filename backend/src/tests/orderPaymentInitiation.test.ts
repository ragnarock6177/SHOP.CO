import { PaymentService } from "../services/payment.service.js";

export function testPaymentContracts() {
  if (typeof PaymentService.createRazorpayOrder !== "function") {
    throw new Error("PaymentService.createRazorpayOrder is not defined");
  }
  if (typeof PaymentService.verifyPaymentSignature !== "function") {
    throw new Error("PaymentService.verifyPaymentSignature is not defined");
  }
  if (typeof PaymentService.handleWebhookEvent !== "function") {
    throw new Error("PaymentService.handleWebhookEvent is not defined");
  }
  console.log("✔ Payment contract interface tests passed");
}

testPaymentContracts();

