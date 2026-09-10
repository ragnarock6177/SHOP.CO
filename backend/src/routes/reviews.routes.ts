import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { CreateReviewSchema } from "../validators/review.validator.js";

const router = Router();

router.post("/", authenticate, validateRequest(CreateReviewSchema), ReviewController.createReview);

export default router;
