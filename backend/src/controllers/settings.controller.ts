import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service.js";
import { SectionsService } from "../services/sections.service.js";
import { BannersService } from "../services/banners.service.js";
import { sendSuccess } from "../utils/response.js";

export class SettingsController {
  // ==========================================
  // Store Settings (Key-Value Groups)
  // ==========================================

  static async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await SettingsService.getAllSettings();
      sendSuccess(res, settings, "Settings retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateGeneralSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "general",
        "store",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "General settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateHeaderSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "header",
        "layout",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "Header settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateContactSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "contact",
        "info",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "Contact settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateSocialSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "social",
        "links",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "Social settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateFooterSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "footer",
        "layout",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "Footer settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateSeoSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await SettingsService.updateSettingsGroup(
        "seo",
        "marketing",
        req.body,
        req.user?.id
      );
      sendSuccess(res, updated, "SEO settings updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Dynamic Homepage Sections
  // ==========================================

  static async listSections(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sections = await SectionsService.getAllSections();
      sendSuccess(res, sections, "Homepage sections retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = await SectionsService.createSection(req.body);
      sendSuccess(res, section, "Homepage section created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const section = await SectionsService.updateSection(id, req.body);
      sendSuccess(res, section, "Homepage section updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async bulkReorderSections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await SectionsService.bulkReorderSections(req.body.sections);
      sendSuccess(res, null, "Homepage sections reordered successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await SectionsService.deleteSection(id);
      sendSuccess(res, null, "Homepage section deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Hero & Campaign Banners
  // ==========================================

  static async listBanners(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banners = await BannersService.getAllBanners();
      sendSuccess(res, banners, "Banners retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banner = await BannersService.createBanner(req.body);
      sendSuccess(res, banner, "Banner created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const banner = await BannersService.updateBanner(id, req.body);
      sendSuccess(res, banner, "Banner updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await BannersService.deleteBanner(id);
      sendSuccess(res, null, "Banner deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
