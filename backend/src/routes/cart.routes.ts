import { Router } from "express";
import { CartController } from "../controllers/cart.controller.js";
import { optionalAuth, authenticate } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { AddCartItemSchema, UpdateCartItemSchema, MergeCartSchema } from "../validators/cart.validator.js";
import { IdParamSchema } from "../validators/user.validator.js";

const router = Router();

router.get("/", optionalAuth, CartController.getCart);
router.post("/items", optionalAuth, validateRequest(AddCartItemSchema), CartController.addItem);
router.patch("/items/:id", optionalAuth, validateRequest(UpdateCartItemSchema), CartController.updateItem);
router.delete("/items/:id", optionalAuth, validateRequest(IdParamSchema), CartController.removeItem);

router.post("/merge", authenticate, validateRequest(MergeCartSchema), CartController.mergeCart);

export default router;
