import { Router } from "express";
import { AdminOrdersController } from "../../controllers/admin/orders.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { UpdateOrderStatusSchema } from "../../validators/admin/orders.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("orders:read"), AdminOrdersController.getOrders);
router.get("/:id", requirePermission("orders:read"), AdminOrdersController.getOrderDetails);
router.get("/:id/history", requirePermission("orders:read"), AdminOrdersController.getOrderStatusHistory);
router.patch(
  "/:id/status",
  requirePermission("orders:update_status"),
  validateRequest(UpdateOrderStatusSchema),
  AdminOrdersController.updateOrderStatus
);

export default router;
