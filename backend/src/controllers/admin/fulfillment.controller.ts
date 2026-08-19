import { Request, Response, NextFunction } from "express";
import { AdminFulfillmentService } from "../../services/admin/fulfillment.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminFulfillmentController {
  static async getShipments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminFulfillmentService.getShipments(req.query);
      sendAdminPaginated(res, result.shipments, result.page, result.limit, result.total, "Shipments list retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getShipmentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shipment = await AdminFulfillmentService.getShipmentDetails(req.params.id);
      sendAdminSuccess(res, shipment, "Shipment details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shipment = await AdminFulfillmentService.createShipment(req.body);
      sendAdminSuccess(res, shipment, "Shipment created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateShipmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shipment = await AdminFulfillmentService.updateShipmentStatus(req.params.id, req.body.status);
      sendAdminSuccess(res, shipment, "Shipment tracking status updated successfully.");
    } catch (error) {
      next(error);
    }
  }
}
