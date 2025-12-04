import { Router } from "express";
import { login, register, handleCallback } from "@/controllers/authController";

const router = Router();

// POST /auth/register
router.post("/register", register);

// POST /auth/login
router.post("/login", login);

// GET /auth/strava/callback?code=AUTH_CODE
router.get("/strava/callback", handleCallback);

export default router;
