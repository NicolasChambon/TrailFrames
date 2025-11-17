import { Router } from "express";
import activitiesRoutes from "./activities";
import authRoutes from "./auth";

const router = Router();

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// API routes
router.use("/auth", authRoutes);
router.use("/activities", activitiesRoutes);

export default router;
