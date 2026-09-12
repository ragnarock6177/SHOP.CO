import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { VerifyPaymentSchema, OrderNumberParamSchema } from "../validators/payment.validator.js";

const router = Router();

router.post(
  "/verify",
  optionalAuth,
  validateRequest(VerifyPaymentSchema),
  PaymentController.verifyPayment
);

router.post("/webhook", PaymentController.handleWebhook);

router.post(
  "/:orderNumber/retry",
  optionalAuth,
  validateRequest(OrderNumberParamSchema),
  PaymentController.retryPayment
);

export default router;
