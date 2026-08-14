import { Router } from "express";
import productsRoutes from "./products.routes.js";
import ordersRoutes from "./orders.routes.js";
import categoriesRoutes from "./categories.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

router.use("/products", productsRoutes);
router.use("/orders", ordersRoutes);
router.use("/categories", categoriesRoutes);
router.use("/auth", authRoutes);

export default router;
