import { Router } from "express";
import { syncActivitiesStream } from "@/controllers/activitiesController";
import {
  getPhotos,
  getPhotoSyncStatus,
  photoSyncStream,
  startPhotoSync,
} from "@/controllers/photoSyncController";
import { requireAuth } from "@/middlewares/auth";
import { csrfProtection, csrfProtectionSSE } from "@/middlewares/csrf";

const router = Router();

// GET /activities/sync/stream
router.get(
  "/sync/stream",
  requireAuth, // 1. JWT authentication
  csrfProtectionSSE, // 2. CSRF protection via query param
  syncActivitiesStream, // 3. Controller
);

// POST /activities/photos/sync - Launch photo sync job (fire & forget)
router.post("/photos/sync", requireAuth, csrfProtection, startPhotoSync);

// GET /activities/photos/sync/stream - SSE stream for photo sync progress
router.get(
  "/photos/sync/stream",
  requireAuth,
  csrfProtectionSSE,
  photoSyncStream,
);

// GET /activities/photos/sync/status - Current status (polling / reconnection)
router.get("/photos/sync/status", requireAuth, getPhotoSyncStatus);

// GET /activities/photos - Photos paginated list
router.get("/photos", requireAuth, getPhotos);

export default router;
