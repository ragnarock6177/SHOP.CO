import { Request, Response, NextFunction } from "express";
import { WishlistService } from "../services/wishlist.service.js";
import { sendSuccess } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class WishlistController {
  static async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const wishlist = await WishlistService.getUserWishlist(req.user.id);
      sendSuccess(res, wishlist, "Wishlist retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const wishlist = await WishlistService.addProductToWishlist(req.user.id, req.body.productId);
      sendSuccess(res, wishlist, "Product added to wishlist successfully");
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const wishlist = await WishlistService.removeProductFromWishlist(req.user.id, req.params.productId);
      sendSuccess(res, wishlist, "Product removed from wishlist successfully");
    } catch (error) {
      next(error);
    }
  }
}
