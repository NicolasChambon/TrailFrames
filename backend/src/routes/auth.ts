import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  register,
  handleCallback,
  refresh,
  logout,
} from "@/controllers/authController";
import { requireAuth } from "@/middlewares/auth";

const WINDOW_MIN = 15;

const authLimiter = rateLimit({
  windowMs: WINDOW_MIN * 60 * 1000, // 15 minutes
  max: 5,
  message: `Too many attempts, please try again after ${WINDOW_MIN} minutes.`,
});

const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", authLimiter, login);

// POST /auth/refresh
router.post("/refresh", refresh);

// POST /auth/logout
router.post("/logout", logout);

// GET /auth/strava/callback?code=AUTH_CODE
router.get("/strava/callback", requireAuth, handleCallback);

export default router;
