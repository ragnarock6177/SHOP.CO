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

  static async getAttributeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attribute = await AdminAttributesService.getAttributeById(req.params.id);
      sendAdminSuccess(res, attribute, "Attribute retrieved successfully.");
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

  static async updateAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attribute = await AdminAttributesService.updateAttribute(req.params.id, req.body);
      sendAdminSuccess(res, attribute, "Attribute updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttribute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminAttributesService.deleteAttribute(req.params.id);
      sendAdminSuccess(res, result, "Attribute deleted successfully.");
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

  static async updateAttributeValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const val = await AdminAttributesService.updateAttributeValue(req.params.valueId, req.body);
      sendAdminSuccess(res, val, "Attribute value updated successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttributeValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminAttributesService.deleteAttributeValue(req.params.valueId);
      sendAdminSuccess(res, result, "Attribute value deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

