import { Router } from "express";
import { AdminCouponsController } from "../../controllers/admin/coupons.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { CreateCouponSchema, UpdateCouponSchema } from "../../validators/admin/coupons.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("coupons:read"), AdminCouponsController.getCoupons);
router.get("/:id", requirePermission("coupons:read"), AdminCouponsController.getCouponDetails);
router.post(
  "/",
  requirePermission("coupons:create"),
  validateRequest(CreateCouponSchema),
  AdminCouponsController.createCoupon
);
router.put(
  "/:id",
  requirePermission("coupons:update"),
  validateRequest(UpdateCouponSchema),
  AdminCouponsController.updateCoupon
);
router.patch("/:id/status", requirePermission("coupons:update"), AdminCouponsController.toggleCouponStatus);

export default router;
