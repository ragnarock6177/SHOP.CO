import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { ProductIdParamSchema } from "../validators/review.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", WishlistController.getWishlist);
router.post("/items", WishlistController.addItem);
router.delete("/items/:productId", validateRequest(ProductIdParamSchema), WishlistController.removeItem);

export default router;
