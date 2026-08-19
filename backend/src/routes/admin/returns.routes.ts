import { Router } from "express";
import { AdminReturnsController } from "../../controllers/admin/returns.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { ProcessRefundSchema, UpdateReturnStatusSchema } from "../../validators/admin/returns.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/refunds", requirePermission("refunds:read"), AdminReturnsController.getRefunds);
router.post(
  "/refunds",
  requirePermission("refunds:create"),
  validateRequest(ProcessRefundSchema),
  AdminReturnsController.processRefund
);

router.get("/", requirePermission("returns:read"), AdminReturnsController.getReturns);
router.get("/:id", requirePermission("returns:read"), AdminReturnsController.getReturnDetails);
router.patch(
  "/:id/status",
  requirePermission("returns:update"),
  validateRequest(UpdateReturnStatusSchema),
  AdminReturnsController.updateReturnStatus
);

export default router;
