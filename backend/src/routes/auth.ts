import { Router } from "express";
import { AuthController } from "@/controllers/authController";

const router = Router();

const authController = new AuthController();

// GET /auth/strava/callback
router.get("/strava/callback", (req, res) =>
  authController.handleCallback(req, res)
);

export default router;
