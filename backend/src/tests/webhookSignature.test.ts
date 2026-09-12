import { PaymentService } from "../services/payment.service.js";
import crypto from "crypto";

export function testWebhookSignatureLogic() {
  const mockWebhookSecret = "test_webhook_secret_abcdef123456";
  const mockPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_test_12345",
          order_id: "order_test_67890",
          amount: 250000,
          status: "captured",
        },
      },
    },
  });

  const validWebhookSignature = crypto
    .createHmac("sha256", mockWebhookSecret)
    .update(mockPayload)
    .digest("hex");

  const isValid = PaymentService.validateWebhookSignature(
    mockPayload,
    validWebhookSignature,
    mockWebhookSecret
  );

  if (!isValid) {
    throw new Error("Webhook signature validation failed for genuine signature");
  }

  const isInvalid = PaymentService.validateWebhookSignature(
    mockPayload,
    "tampered_webhook_signature",
    mockWebhookSecret
  );

  if (isInvalid) {
    throw new Error("Webhook signature validation incorrectly passed for invalid signature");
  }

  console.log("✔ Webhook signature HMAC-SHA256 unit test passed");
}

testWebhookSignatureLogic();
