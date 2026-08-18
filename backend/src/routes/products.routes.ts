import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { ProductFilterQuerySchema, SlugParamSchema } from "../validators/catalog.validator.js";

const router = Router();

router.get("/", validateRequest(ProductFilterQuerySchema), ProductController.getProducts);
router.get("/:slug", validateRequest(SlugParamSchema), ProductController.getProductBySlug);

export default router;
