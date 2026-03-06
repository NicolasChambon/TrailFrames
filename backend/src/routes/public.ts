import { Router, type Request, type Response } from "express";
import { logger } from "@/lib/logger";

const router = Router();

// GET / - Root route - Return a simple message to confirm the API is running
router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "TrailFrames API" });
});

// GET /health - Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  logger.debug("Health check performed");
  res.json({ status: "ok", message: "Backend is running" });
});

export default router;
