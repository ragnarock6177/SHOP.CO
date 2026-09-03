import { Router } from "express";
import { AdminAttributesController } from "../../controllers/admin/attributes.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("attributes:read"), AdminAttributesController.getAttributes);
router.get("/:id", requirePermission("attributes:read"), AdminAttributesController.getAttributeById);
router.post("/", requirePermission("attributes:create"), AdminAttributesController.createAttribute);
router.put("/:id", requirePermission("attributes:update"), AdminAttributesController.updateAttribute);
router.delete("/:id", requirePermission("attributes:delete"), AdminAttributesController.deleteAttribute);

router.post("/:id/values", requirePermission("attributes:create"), AdminAttributesController.addAttributeValue);
router.put("/values/:valueId", requirePermission("attributes:update"), AdminAttributesController.updateAttributeValue);
router.delete("/values/:valueId", requirePermission("attributes:delete"), AdminAttributesController.deleteAttributeValue);

export default router;
