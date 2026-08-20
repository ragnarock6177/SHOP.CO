import { Request, Response, NextFunction } from "express";
import { AdminProductsService } from "../../services/admin/products.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminProductsController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminProductsService.getProducts(req.query);
      sendAdminPaginated(
        res,
        result.products,
        result.page,
        result.limit,
        result.total,
        "Catalog products retrieved successfully."
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await AdminProductsService.getProductById(req.params.id);
      sendAdminSuccess(res, product, "Product details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await AdminProductsService.createProduct(req.body);
      sendAdminSuccess(res, product, "Product created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await AdminProductsService.updateProduct(req.params.id, req.body);
      sendAdminSuccess(res, product, "Product updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }

  static async archiveProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminProductsService.archiveProduct(req.params.id);
      sendAdminSuccess(res, result, "Product archived successfully.", 200);
    } catch (error) {
      next(error);
    }
  }

  // ── Image CRUD ────────────────────────────────────────────

  static async listImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const images = await AdminProductsService.listImages(req.params.id);
      sendAdminSuccess(res, images, "Product images retrieved.");
    } catch (error) {
      next(error);
    }
  }

  static async addImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const image = await AdminProductsService.addImage(req.params.id, req.body);
      sendAdminSuccess(res, image, "Image added to product.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const image = await AdminProductsService.updateImage(
        req.params.id,
        req.params.imageId,
        req.body
      );
      sendAdminSuccess(res, image, "Image updated.");
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminProductsService.deleteImage(req.params.id, req.params.imageId);
      sendAdminSuccess(res, result, "Image deleted.");
    } catch (error) {
      next(error);
    }
  }

  static async reorderImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const images = await AdminProductsService.reorderImages(req.params.id, req.body.orderedIds);
      sendAdminSuccess(res, images, "Images reordered.");
    } catch (error) {
      next(error);
    }
  }
}

