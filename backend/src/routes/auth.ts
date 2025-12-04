import { Router } from "express";
import {
  login,
  register,
  handleCallback,
  refresh,
  logout,
} from "@/controllers/authController";
import { requireAuth } from "@/middleware/auth";

const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// POST /auth/refresh
router.post("/refresh", refresh);

// POST /auth/logout
router.post("/logout", logout);

// GET /auth/strava/callback?code=AUTH_CODE
router.get("/strava/callback", requireAuth, handleCallback);

export default router;
