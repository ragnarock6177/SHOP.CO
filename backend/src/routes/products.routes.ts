import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { ReviewController } from "../controllers/review.controller.js";
import { optionalAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { ProductFilterQuerySchema, SlugParamSchema } from "../validators/catalog.validator.js";
import { ProductReviewsListSchema } from "../validators/review.validator.js";

const router = Router();

router.get("/", validateRequest(ProductFilterQuerySchema), ProductController.getProducts);
router.get("/filters", ProductController.getFilters);
router.get(
  "/:productId/reviews",
  optionalAuth,
  validateRequest(ProductReviewsListSchema),
  ReviewController.getProductReviews,
);
router.get("/:slug", validateRequest(SlugParamSchema), ProductController.getProductBySlug);

export default router;
