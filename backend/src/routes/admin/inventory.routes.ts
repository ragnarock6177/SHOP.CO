import { Router } from "express";
import { AdminInventoryController } from "../../controllers/admin/inventory.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { AdjustInventorySchema, UpdateThresholdSchema } from "../../validators/admin/inventory.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("inventory:read"), AdminInventoryController.getInventory);
router.post(
  "/adjust",
  requirePermission("inventory:adjust"),
  validateRequest(AdjustInventorySchema),
  AdminInventoryController.adjustInventory
);
router.get("/movements", requirePermission("inventory:read"), AdminInventoryController.getInventoryMovements);
router.get("/reservations", requirePermission("inventory:read"), AdminInventoryController.getInventoryReservations);
router.put(
  "/:variantId/threshold",
  requirePermission("inventory:update"),
  validateRequest(UpdateThresholdSchema),
  AdminInventoryController.updateReorderLevel
);

export default router;
