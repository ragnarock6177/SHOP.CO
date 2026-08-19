import { Router } from "express";
import { AdminReviewsController } from "../../controllers/admin/reviews.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("reviews:read"), AdminReviewsController.getReviews);
router.patch("/:id/publish", requirePermission("reviews:moderate"), AdminReviewsController.toggleReviewPublish);
router.delete("/:id", requirePermission("reviews:delete"), AdminReviewsController.deleteReview);

export default router;
