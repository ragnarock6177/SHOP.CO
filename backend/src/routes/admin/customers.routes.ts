import { Router } from "express";
import { AdminCustomersController } from "../../controllers/admin/customers.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { UpdateAdminUserStatusSchema } from "../../validators/admin/adminUsers.validator.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("customers:read"), AdminCustomersController.getCustomers);
router.get("/:id", requirePermission("customers:read"), AdminCustomersController.getCustomerDetails);
router.get("/:id/orders", requirePermission("customers:read"), AdminCustomersController.getCustomerOrders);
router.patch(
  "/:id/status",
  requirePermission("customers:update"),
  validateRequest(UpdateAdminUserStatusSchema),
  AdminCustomersController.updateCustomerStatus
);

export default router;
