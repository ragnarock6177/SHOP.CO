import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateCheckUserInput,
} from "../validators/auth.validator.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

// Rate Limiter for Authentication Endpoints (max 30 requests per 15 minutes)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Unified register/login for Email, Phone (Firebase), and Google (Firebase)
 * @access  Public
 */
router.post(
  "/register",
  authRateLimiter,
  validateRegisterInput,
  AuthController.register,
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Email/Password login
 * @access  Public
 */
router.post(
  "/login",
  authRateLimiter,
  validateLoginInput,
  AuthController.login,
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get currently logged in user profile
 * @access  Private (Backend JWT required)
 */
router.get("/me", authenticateJwt, AuthController.me);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private (Backend JWT required)
 */
router.post("/logout", authenticateJwt, AuthController.logout);

router.post(
  "/check-user",
  authRateLimiter,
  validateCheckUserInput,
  AuthController.checkUser,
);

export default router;



