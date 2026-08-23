import { Router } from "express";
import { PublicSettingsController } from "../controllers/publicSettings.controller.js";

const router = Router();

// Public consolidated settings endpoint
// GET /api/v1/settings/storefront
router.get("/storefront", PublicSettingsController.getStorefrontSettings);

export default router;
