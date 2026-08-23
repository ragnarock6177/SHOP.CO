import { Router } from "express";
import { SettingsController } from "../../controllers/settings.controller.js";
import { requireAdminAuth } from "../../middleware/adminAuth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validateRequest } from "../../middleware/validate.js";
import { z } from "zod";
import {
  updateGeneralSettingsSchema,
  updateHeaderSettingsSchema,
  updateContactSettingsSchema,
  updateSocialSettingsSchema,
  updateFooterSettingsSchema,
  updateSeoSettingsSchema,
  createHomepageSectionSchema,
  updateHomepageSectionSchema,
  bulkReorderSectionsSchema,
  createBannerSchema,
  updateBannerSchema,
} from "../../validators/settings.validator.js";

const router = Router();

// Protect all admin settings routes with auth & permissions
router.use(requireAdminAuth);
router.use(requirePermission("settings:manage"));

// ==========================================
// 1. Store Settings (Grouped Key-Value)
// ==========================================
router.get("/", SettingsController.getSettings);

router.put(
  "/general",
  validateRequest(z.object({ body: updateGeneralSettingsSchema })),
  SettingsController.updateGeneralSettings
);

router.put(
  "/header",
  validateRequest(z.object({ body: updateHeaderSettingsSchema })),
  SettingsController.updateHeaderSettings
);

router.put(
  "/contact",
  validateRequest(z.object({ body: updateContactSettingsSchema })),
  SettingsController.updateContactSettings
);

router.put(
  "/social",
  validateRequest(z.object({ body: updateSocialSettingsSchema })),
  SettingsController.updateSocialSettings
);

router.put(
  "/footer",
  validateRequest(z.object({ body: updateFooterSettingsSchema })),
  SettingsController.updateFooterSettings
);

router.put(
  "/seo",
  validateRequest(z.object({ body: updateSeoSettingsSchema })),
  SettingsController.updateSeoSettings
);

// ==========================================
// 2. Dynamic Homepage Sections
// ==========================================
router.get("/sections", SettingsController.listSections);

router.post(
  "/sections",
  validateRequest(z.object({ body: createHomepageSectionSchema })),
  SettingsController.createSection
);

router.put(
  "/sections/reorder",
  validateRequest(z.object({ body: bulkReorderSectionsSchema })),
  SettingsController.bulkReorderSections
);

router.put(
  "/sections/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: updateHomepageSectionSchema,
    })
  ),
  SettingsController.updateSection
);

router.delete("/sections/:id", SettingsController.deleteSection);

// ==========================================
// 3. Hero & Campaign Banners
// ==========================================
router.get("/banners", SettingsController.listBanners);

router.post(
  "/banners",
  validateRequest(z.object({ body: createBannerSchema })),
  SettingsController.createBanner
);

router.put(
  "/banners/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string().uuid() }),
      body: updateBannerSchema,
    })
  ),
  SettingsController.updateBanner
);

router.delete("/banners/:id", SettingsController.deleteBanner);

export default router;
