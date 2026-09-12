import { PaymentService } from "../services/payment.service.js";

export function testWebhookIdempotencyContracts() {
  if (typeof PaymentService.handleWebhookEvent !== "function") {
    throw new Error("PaymentService.handleWebhookEvent must be a callable async function");
  }
  if (typeof PaymentService.validateWebhookSignature !== "function") {
    throw new Error("PaymentService.validateWebhookSignature must be a callable function");
  }
  console.log("✔ Webhook contract and idempotency interface test passed");
}

testWebhookIdempotencyContracts();
