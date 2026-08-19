import { Router } from "express";
import { AdminCategoriesController } from "../../controllers/admin/categories.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("categories:read"), AdminCategoriesController.getCategories);
router.post("/", requirePermission("categories:create"), AdminCategoriesController.createCategory);
router.put("/:id", requirePermission("categories:update"), AdminCategoriesController.updateCategory);

export default router;
