import { Request, Response, NextFunction } from "express";
import { UploadService } from "../../services/admin/upload.service.js";
import { sendAdminSuccess } from "../../utils/adminResponse.js";

export class UploadController {
  static async presignProductImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId, fileName, mimeType } = req.body as {
        productId: string;
        fileName: string;
        mimeType: string;
      };

      const result = await UploadService.presignProductImage(productId, fileName, mimeType);
      sendAdminSuccess(res, result, "Upload URL generated.");
    } catch (error) {
      next(error);
    }
  }

  static async uploadBannerImage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { image, fileName } = req.body as {
        image: string;
        fileName?: string;
      };

      if (!image) {
        res.status(400).json({ success: false, error: { message: "Image base64 payload is required" } });
        return;
      }

      const result = await UploadService.uploadBannerImage(image, fileName || "banner.webp");
      sendAdminSuccess(res, result, "Banner image uploaded and compressed successfully.");
    } catch (error) {
      next(error);
    }
  }
}
