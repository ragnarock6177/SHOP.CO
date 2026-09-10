import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service.js";
import { sendSuccess } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class ReviewController {
  static async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      const page = req.query.page as string | undefined;
      const limit = req.query.limit as string | undefined;
      const result = await ReviewService.getPublishedReviewsForProduct(
        productId,
        page,
        limit,
        req.user?.id,
      );
      sendSuccess(res, result, "Product reviews retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const review = await ReviewService.submitProductReview(req.user.id, req.body);
      sendSuccess(res, review, review.message, 201);
    } catch (error) {
      next(error);
    }
  }
}
