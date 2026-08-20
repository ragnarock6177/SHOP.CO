import { Router, Request, Response } from "express";
import dashboardRoutes from "./dashboard.routes.js";
import productsRoutes from "./products.routes.js";
import categoriesRoutes from "./categories.routes.js";
import collectionsRoutes from "./collections.routes.js";
import attributesRoutes from "./attributes.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import customersRoutes from "./customers.routes.js";
import ordersRoutes from "./orders.routes.js";
import fulfillmentRoutes from "./fulfillment.routes.js";
import paymentsRoutes from "./payments.routes.js";
import couponsRoutes from "./coupons.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import returnsRoutes from "./returns.routes.js";
import auditRoutes from "./audit.routes.js";
import adminUsersRoutes from "./adminUsers.routes.js";
import rolesRoutes from "./roles.routes.js";
import uploadRoutes from "./upload.routes.js";
import legacyAdminRoutes from "../admin.routes.js";
import { sendSuccess } from "../../utils/response.js";

const adminRouter = Router();

// Admin Root Health / Status Endpoint
adminRouter.get("/", (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      name: "AIRAVÉ Admin Platform API",
      version: "v1",
      status: "HEALTHY",
    },
    "Admin API root endpoint active.",
    200
  );
});

// Modular Administrative Sub-Routers
adminRouter.use("/dashboard", dashboardRoutes);
adminRouter.use("/products", productsRoutes);
adminRouter.use("/categories", categoriesRoutes);
adminRouter.use("/collections", collectionsRoutes);
adminRouter.use("/attributes", attributesRoutes);
adminRouter.use("/inventory", inventoryRoutes);
adminRouter.use("/customers", customersRoutes);
adminRouter.use("/orders", ordersRoutes);
adminRouter.use("/fulfillment", fulfillmentRoutes);
adminRouter.use("/payments", paymentsRoutes);
adminRouter.use("/coupons", couponsRoutes);
adminRouter.use("/reviews", reviewsRoutes);
adminRouter.use("/returns", returnsRoutes);
adminRouter.use("/audit-logs", auditRoutes);
adminRouter.use("/admin-users", adminUsersRoutes);
adminRouter.use("/roles", rolesRoutes);
adminRouter.use("/upload", uploadRoutes);

// Delegation to legacy admin route handlers
adminRouter.use("/", legacyAdminRoutes);

export default adminRouter;
