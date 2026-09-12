import { verifyPaymentApi, retryPaymentApi } from "../lib/paymentApi";

export function testPaymentApiContracts() {
  if (typeof verifyPaymentApi !== "function") {
    throw new Error("verifyPaymentApi client must be a function");
  }
  if (typeof retryPaymentApi !== "function") {
    throw new Error("retryPaymentApi client must be a function");
  }
  console.log("✔ Frontend payment API client contract tests passed");
}

testPaymentApiContracts();
