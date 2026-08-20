import { Router } from "express";
import { UploadController } from "../../controllers/admin/upload.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";

const router = Router();

router.use(requireAdminAuth);

// POST /admin/upload/presign — get a signed URL to upload a product image directly to storage
router.post(
  "/presign",
  requirePermission("products:update"),
  UploadController.presignProductImage
);

export default router;
