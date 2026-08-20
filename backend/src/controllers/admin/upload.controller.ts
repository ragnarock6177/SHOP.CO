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
}
