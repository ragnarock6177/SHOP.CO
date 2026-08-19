import { Router } from "express";
import { AdminPaymentsController } from "../../controllers/admin/payments.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

router.get("/", requirePermission("payments:read"), AdminPaymentsController.getPayments);
router.get("/invoices", requirePermission("payments:read"), AdminPaymentsController.getInvoices);
router.get("/:id", requirePermission("payments:read"), AdminPaymentsController.getPaymentDetails);

export default router;
