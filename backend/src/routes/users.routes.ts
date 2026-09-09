import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import {
  UpdateProfileSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
  IdParamSchema,
} from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", UserController.getProfile);
router.patch("/me", validateRequest(UpdateProfileSchema), UserController.updateProfile);
router.get("/me/addresses", UserController.getAddresses);
router.post("/me/addresses", validateRequest(CreateAddressSchema), UserController.addAddress);
router.patch("/me/addresses/:id", validateRequest(UpdateAddressSchema), UserController.updateAddress);
router.patch("/me/addresses/:id/default", validateRequest(IdParamSchema), UserController.setDefaultAddress);
router.delete("/me/addresses/:id", validateRequest(IdParamSchema), UserController.deleteAddress);

export default router;
