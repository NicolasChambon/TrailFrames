import { Router } from "express";
import { syncActivitiesStream } from "@/controllers/activitiesController";
import { requireAuth } from "@/middlewares/auth";
import { csrfProtectionSSE } from "@/middlewares/csrf";

const router = Router();

// TODO: plan to implement integration tests for this route
// GET /activities/sync/stream
router.get(
  "/sync/stream",
  requireAuth, // 1. JWT authentication
  csrfProtectionSSE, // 2. CSRF protection via query param
  syncActivitiesStream, // 3. Controller
);

export default router;
