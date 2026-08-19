import { Router } from "express";
import { AdminAuditController } from "../../controllers/admin/audit.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("audit_logs:read"), AdminAuditController.getAuditLogs);
router.get("/:id", requirePermission("audit_logs:read"), AdminAuditController.getAuditLogById);

export default router;
