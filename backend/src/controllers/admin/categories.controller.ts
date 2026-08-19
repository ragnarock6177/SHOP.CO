import { Request, Response, NextFunction } from "express";
import { AdminCategoriesService } from "../../services/admin/categories.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminCategoriesController {
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCategoriesService.getCategories(req.query);
      sendAdminPaginated(res, result.categories, result.page, result.limit, result.total, "Categories retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await AdminCategoriesService.createCategory(req.body);
      sendAdminSuccess(res, category, "Category created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await AdminCategoriesService.updateCategory(req.params.id, req.body);
      sendAdminSuccess(res, category, "Category updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }
}
