import { Router } from "express";
import { AdminProductsController } from "../../controllers/admin/products.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { CreateProductSchema, UpdateProductSchema } from "../../validators/admin/products.validator.js";

const router = Router();

router.use(requireAdminAuth);

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

export default router;
