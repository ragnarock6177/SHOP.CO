import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service.js";
import { sendSuccess } from "../utils/response.js";

export class PublicSettingsController {
  /**
   * Get consolidated public storefront settings.
   * GET /api/v1/settings/storefront
   */
  static async getStorefrontSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = await SettingsService.getStorefrontSettingsPayload();

      // Disable backend HTTP caching so settings are always fresh on revalidation
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );

      sendSuccess(res, payload, "Storefront settings retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
