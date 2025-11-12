import { Router } from "express";
import { AuthController } from "@/controllers/authController";

const router = Router();

const authController = new AuthController();

router.get("/strava/url", (req, res) => authController.getAuthUrl(req, res));
router.get("/strava/callback", (req, res) =>
  authController.handleCallback(req, res)
);

export default router;
