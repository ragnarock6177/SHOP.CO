import { Router } from "express";
import { AdminAttributesController } from "../../controllers/admin/attributes.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("attributes:read"), AdminAttributesController.getAttributes);
router.post("/", requirePermission("attributes:create"), AdminAttributesController.createAttribute);
router.post("/:id/values", requirePermission("attributes:create"), AdminAttributesController.addAttributeValue);

export default router;
