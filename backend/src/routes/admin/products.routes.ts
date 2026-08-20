import { Router } from "express";
import { AdminProductsController } from "../../controllers/admin/products.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { CreateProductSchema, UpdateProductSchema } from "../../validators/admin/products.validator.js";

const router = Router();

router.use(requireAdminAuth);

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

export default router;

