import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { sendError } from "./utils/response.js";

const app: Express = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

// Global Rate Limiting
app.use(globalRateLimiter);

// Request Logging & Body Parsing
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API V1 Base Router
app.use("/api/v1", routes);

// 404 Unmatched Route Handler
app.use((_req: Request, res: Response) => {
  sendError(res, 404, "NOT_FOUND", "The requested API endpoint was not found on this server");
});

// Centralized Error Handler Middleware
app.use(errorHandler);

export default app;
