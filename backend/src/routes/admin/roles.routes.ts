import { Router } from "express";
import { RolesController } from "../../controllers/admin/roles.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { CreateRoleSchema, UpdateRoleSchema } from "../../validators/admin/roles.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("roles:read"), RolesController.getRoles);
router.get("/permissions", requirePermission("roles:read"), RolesController.getPermissions);
router.get("/:id", requirePermission("roles:read"), RolesController.getRoleById);
router.post(
  "/",
  requirePermission("roles:create"),
  validateRequest(CreateRoleSchema),
  RolesController.createRole
);
router.put(
  "/:id",
  requirePermission("roles:update"),
  validateRequest(UpdateRoleSchema),
  RolesController.updateRole
);

export default router;
