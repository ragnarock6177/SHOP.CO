import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/create-intent", authenticate, PaymentController.createIntent);
router.post("/webhook", PaymentController.handleWebhook);

export default router;
