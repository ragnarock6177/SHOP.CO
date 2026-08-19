import { Router } from "express";
import { AdminUsersController } from "../../controllers/admin/adminUsers.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import {
  CreateAdminUserSchema,
  UpdateAdminUserSchema,
  UpdateAdminUserStatusSchema,
} from "../../validators/admin/adminUsers.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("admin_users:read"), AdminUsersController.getAdminUsers);
router.post(
  "/",
  requirePermission("admin_users:create"),
  validateRequest(CreateAdminUserSchema),
  AdminUsersController.createAdminUser
);
router.put(
  "/:id",
  requirePermission("admin_users:update"),
  validateRequest(UpdateAdminUserSchema),
  AdminUsersController.updateAdminUser
);
router.patch(
  "/:id/status",
  requirePermission("admin_users:update"),
  validateRequest(UpdateAdminUserStatusSchema),
  AdminUsersController.updateUserStatus
);

export default router;
