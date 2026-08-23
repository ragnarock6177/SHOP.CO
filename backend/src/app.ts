import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { sendError } from "./utils/response.js";

const app: Express = express();

// Security Headers (configured to allow cross-origin image loading)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration: Allow storefront (3000), admin panel (3001), and Vercel production domains
const defaultAllowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
  })
);

// Global Rate Limiting
app.use(globalRateLimiter);

// Request Logging & Body Parsing (increased limit to 15mb for compressed high-res image uploads)
app.use(morgan("dev"));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Static upload file serving
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

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
