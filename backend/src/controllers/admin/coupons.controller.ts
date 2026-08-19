import { Request, Response, NextFunction } from "express";
import { AdminCouponsService } from "../../services/admin/coupons.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminCouponsController {
  static async getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminCouponsService.getCoupons(req.query);
      sendAdminPaginated(res, result.coupons, result.page, result.limit, result.total, "Coupons list retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async getCouponDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await AdminCouponsService.getCouponDetails(req.params.id);
      sendAdminSuccess(res, coupon, "Coupon details retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await AdminCouponsService.createCoupon(req.body);
      sendAdminSuccess(res, coupon, "Coupon created successfully.", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await AdminCouponsService.updateCoupon(req.params.id, req.body);
      sendAdminSuccess(res, coupon, "Coupon updated successfully.", 200);
    } catch (error) {
      next(error);
    }
  }

  static async toggleCouponStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await AdminCouponsService.toggleCouponStatus(req.params.id, req.body.isActive);
      sendAdminSuccess(res, coupon, `Coupon active status set to '${req.body.isActive}'.`, 200);
    } catch (error) {
      next(error);
    }
  }
}
