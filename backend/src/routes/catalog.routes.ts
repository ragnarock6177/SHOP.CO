import { Router } from "express";
import { CatalogController } from "../controllers/catalog.controller.js";
import { validateRequest } from "../middleware/validate.js";
import { SlugParamSchema } from "../validators/catalog.validator.js";

const router = Router();

// Collections
router.get("/collections", CatalogController.getCollections);
router.get("/collections/:slug", validateRequest(SlugParamSchema), CatalogController.getCollectionBySlug);

// Categories
router.get("/categories", CatalogController.getCategories);
router.get("/categories/:slug", validateRequest(SlugParamSchema), CatalogController.getCategoryBySlug);

export default router;
