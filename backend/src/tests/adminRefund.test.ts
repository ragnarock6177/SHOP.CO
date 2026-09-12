import { AdminPaymentsService } from "../services/admin/payments.service.js";
import { PaymentService } from "../services/payment.service.js";

export function testAdminRefundContracts() {
  if (typeof AdminPaymentsService.refundPayment !== "function") {
    throw new Error("AdminPaymentsService.refundPayment must be a defined function");
  }
  if (typeof PaymentService.refundPayment !== "function") {
    throw new Error("PaymentService.refundPayment must be a defined function");
  }
  console.log("✔ Admin refund service and contract interface tests passed");
}

testAdminRefundContracts();
