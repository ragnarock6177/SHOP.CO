import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validateRequest } from "../middleware/validate.js";
import { CreateAdminProductSchema, UpdateOrderStatusSchema, AdjustInventorySchema } from "../validators/admin.validator.js";

const router = Router();

// Protect all admin routes with auth & ADMIN/SUPER_ADMIN role guard
router.use(authenticate);
router.use(requireRole(["ADMIN", "SUPER_ADMIN"]));

router.post("/products", validateRequest(CreateAdminProductSchema), AdminController.createProduct);
router.patch("/orders/:id/status", validateRequest(UpdateOrderStatusSchema), AdminController.updateOrderStatus);
router.patch("/inventory/:variantId", validateRequest(AdjustInventorySchema), AdminController.adjustInventory);
router.get("/audit-logs", AdminController.getAuditLogs);

export default router;
