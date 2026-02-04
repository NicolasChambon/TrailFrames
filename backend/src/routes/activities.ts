import { Router } from "express";
import { syncActivitiesStream } from "@/controllers/activitiesController";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

// GET /activities/sync/stream
router.get("/sync/stream", requireAuth, syncActivitiesStream);

export default router;
