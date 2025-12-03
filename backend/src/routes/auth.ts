import { Router } from "express";
import { register, handleCallback } from "@/controllers/authController";

const router = Router();

// POST /auth/register
router.post("/register", register);

// GET /auth/strava/callback?code=AUTH_CODE
router.get("/strava/callback", handleCallback);

export default router;
