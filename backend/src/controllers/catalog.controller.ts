import { Request, Response, NextFunction } from "express";
import { CatalogService } from "../services/catalog.service.js";
import { sendSuccess } from "../utils/response.js";

export class CatalogController {
  static async getCollections(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await CatalogService.listCollections();
      sendSuccess(res, collections, "Collections retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCollectionBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await CatalogService.getCollectionBySlug(req.params.slug);
      sendSuccess(res, collection, "Collection details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CatalogService.listCategoriesTree();
      sendSuccess(res, categories, "Categories tree retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CatalogService.getCategoryBySlug(req.params.slug);
      sendSuccess(res, category, "Category details retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}
