import { Request, Response, NextFunction } from "express";
import { AdminAttributesService } from "../../services/admin/attributes.service.js";
import { sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminAttributesController {
  static async getAttributes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attributes = await AdminAttributesService.getAttributes();
      sendAdminSuccess(res, attributes, "Attributes retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attribute = await AdminAttributesService.createAttribute(req.body);
      sendAdminSuccess(res, attribute, "Attribute created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async addAttributeValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const val = await AdminAttributesService.addAttributeValue(req.params.id, req.body);
      sendAdminSuccess(res, val, "Attribute value created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }
}
