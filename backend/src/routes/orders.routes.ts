import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { CheckoutController } from "../controllers/checkout.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  CreateOrderSchema,
  CheckoutSummarySchema,
  OrderNumberParamSchema,
} from "../validators/order.validator.js";
import { IdParamSchema } from "../validators/user.validator.js";

const router = Router();

router.post(
  "/checkout/summary",
  optionalAuth,
  validateRequest(CheckoutSummarySchema),
  CheckoutController.calculateSummary
);

router.post(
  "/",
  optionalAuth,
  validateRequest(CreateOrderSchema),
  OrderController.placeOrder
);

router.get("/", authenticate, OrderController.getUserOrders);

router.get(
  "/:orderNumber",
  optionalAuth,
  validateRequest(OrderNumberParamSchema),
  OrderController.getOrderByNumber
);

router.post(
  "/:id/cancel",
  authenticate,
  validateRequest(IdParamSchema),
  OrderController.cancelOrder
);

export default router;
