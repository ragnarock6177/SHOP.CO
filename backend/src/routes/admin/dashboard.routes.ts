import { Router } from "express";
import { DashboardController } from "../../controllers/admin/dashboard.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("dashboard:read"), DashboardController.getDashboardMetrics);

export default router;
