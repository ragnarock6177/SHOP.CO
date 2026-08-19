import { Router } from "express";
import { AdminFulfillmentController } from "../../controllers/admin/fulfillment.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { CreateShipmentSchema, UpdateShipmentStatusSchema } from "../../validators/admin/fulfillment.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("fulfillment:read"), AdminFulfillmentController.getShipments);
router.get("/:id", requirePermission("fulfillment:read"), AdminFulfillmentController.getShipmentDetails);
router.post(
  "/",
  requirePermission("fulfillment:create"),
  validateRequest(CreateShipmentSchema),
  AdminFulfillmentController.createShipment
);
router.patch(
  "/:id/status",
  requirePermission("fulfillment:update"),
  validateRequest(UpdateShipmentStatusSchema),
  AdminFulfillmentController.updateShipmentStatus
);

export default router;
