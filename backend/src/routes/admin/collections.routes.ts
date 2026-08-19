import { Router } from "express";
import { AdminCollectionsController } from "../../controllers/admin/collections.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("collections:read"), AdminCollectionsController.getCollections);
router.post("/", requirePermission("collections:create"), AdminCollectionsController.createCollection);
router.put("/:id", requirePermission("collections:update"), AdminCollectionsController.updateCollection);

export default router;
