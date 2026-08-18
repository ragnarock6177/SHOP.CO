import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service.js";
import { sendSuccess } from "../utils/response.js";
import { UnauthorizedError } from "../utils/errors.js";

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.getOrCreateCart(req.user?.id, req.guestToken);
      sendSuccess(res, cart, "Cart retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.addItemToCart(req.body, req.user?.id, req.guestToken);
      sendSuccess(res, cart, "Item added to cart successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.updateItemQuantity(
        req.params.id,
        req.body.quantity,
        req.user?.id,
        req.guestToken
      );
      sendSuccess(res, cart, "Cart item updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.removeItemFromCart(req.params.id, req.user?.id, req.guestToken);
      sendSuccess(res, cart, "Cart item removed successfully");
    } catch (error) {
      next(error);
    }
  }

  static async mergeCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const cart = await CartService.mergeGuestCartToUser(req.body.guestToken, req.user.id);
      sendSuccess(res, cart, "Guest cart merged into user cart successfully");
    } catch (error) {
      next(error);
    }
  }
}
