import { Router } from "express";
import { AdminProductsController } from "../../controllers/admin/products.controller.js";
import { BulkImportController } from "../../controllers/admin/bulkImport.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { uploadSpreadsheet } from "../../middleware/upload.js";
import {
  CreateProductSchema,
  UpdateProductSchema,
  CreateVariantSchema,
  UpdateVariantSchema,
} from "../../validators/admin/products.validator.js";

const router = Router();

router.use(requireAdminAuth);

// ── Bulk Product & Variant Import ─────────────────────────────────────────────
router.get(
  "/import/template",
  requirePermission("products:read"),
  BulkImportController.downloadTemplate
);
router.post(
  "/import/validate",
  requirePermission("products:create"),
  uploadSpreadsheet.single("file"),
  BulkImportController.validateImport
);
router.post(
  "/import/execute",
  requirePermission("products:create"),
  uploadSpreadsheet.single("file"),
  BulkImportController.executeImport
);
router.post(
  "/import/errors/export",
  requirePermission("products:read"),
  BulkImportController.exportErrors
);

// ── Product CRUD ──────────────────────────────────────────────────────────────
router.get("/", requirePermission("products:read"), AdminProductsController.getProducts);
router.get("/:id", requirePermission("products:read"), AdminProductsController.getProductById);
router.post(
  "/",
  requirePermission("products:create"),
  validateRequest(CreateProductSchema),
  AdminProductsController.createProduct
);
router.put(
  "/:id",
  requirePermission("products:update"),
  validateRequest(UpdateProductSchema),
  AdminProductsController.updateProduct
);
router.delete("/:id", requirePermission("products:delete"), AdminProductsController.archiveProduct);

// ── Product Image CRUD ────────────────────────────────────────────────────────
router.get("/:id/images", requirePermission("products:read"), AdminProductsController.listImages);
router.post("/:id/images", requirePermission("products:update"), AdminProductsController.addImage);
router.patch("/:id/images/:imageId", requirePermission("products:update"), AdminProductsController.updateImage);
router.delete("/:id/images/:imageId", requirePermission("products:update"), AdminProductsController.deleteImage);
router.put("/:id/images/reorder", requirePermission("products:update"), AdminProductsController.reorderImages);

// ── Product Variant CRUD ──────────────────────────────────────────────────────
router.post(
  "/:id/variants",
  requirePermission("products:update"),
  validateRequest(CreateVariantSchema),
  AdminProductsController.addVariant
);
router.put(
  "/:id/variants/:variantId",
  requirePermission("products:update"),
  validateRequest(UpdateVariantSchema),
  AdminProductsController.updateVariant
);
router.delete(
  "/:id/variants/:variantId",
  requirePermission("products:update"),
  AdminProductsController.deleteVariant
);

export default router;


