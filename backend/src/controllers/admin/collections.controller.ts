import { Request, Response, NextFunction } from "express";
import { AdminCollectionsService } from "../../services/admin/collections.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminCollectionsController {
  static async getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCollectionsService.getCollections(req.query);
      sendAdminPaginated(res, result.collections, result.page, result.limit, result.total, "Collections retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await AdminCollectionsService.createCollection(req.body);
      sendAdminSuccess(res, collection, "Collection created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await AdminCollectionsService.updateCollection(req.params.id, req.body);
      sendAdminSuccess(res, collection, "Collection updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }
}
