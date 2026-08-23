import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import catalogRoutes from "./catalog.routes.js";
import productsRoutes from "./products.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import ordersRoutes from "./orders.routes.js";
import paymentsRoutes from "./payments.routes.js";
import settingsRoutes from "./settings.routes.js";
import adminRoutes from "./admin/index.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/", catalogRoutes); // /collections & /categories
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin", adminRoutes);

export default router;
