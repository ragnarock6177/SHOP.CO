import { Request, Response, NextFunction } from "express";
import { AdminReviewsService } from "../../services/admin/reviews.service.js";
import { sendAdminPaginated, sendAdminSuccess } from "../../utils/adminResponse.js";

export class AdminReviewsController {
  static async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminReviewsService.getReviews(req.query);
      sendAdminPaginated(res, result.reviews, result.page, result.limit, result.total, "Product reviews retrieved successfully.");
    } catch (error) {
      next(error);
    }
  }

  static async toggleReviewPublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await AdminReviewsService.toggleReviewPublish(req.params.id, req.body.isPublished);
      sendAdminSuccess(res, review, `Review publication status set to '${req.body.isPublished}'.`);
    } catch (error) {
      next(error);
    }
  }

  static async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AdminReviewsService.deleteReview(req.params.id);
      sendAdminSuccess(res, result, "Product review deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}
