import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, meta } = await ProductService.listProducts(req.query as any);
      sendPaginated(res, data, meta, "Products retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getProductDetailsBySlug(req.params.slug);
      sendSuccess(res, product, "Product details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
