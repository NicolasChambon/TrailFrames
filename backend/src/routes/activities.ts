import { Router } from "express";
import { syncActivitiesStream } from "@/controllers/activitiesController";
import { requireAuth } from "@/middlewares/auth";
// import { syncActivities } from "@/controllers/activitiesController";

const router = Router();

// TODO: Remove this endpoint later
// PUT /activities
// router.put("/", requireAuth, syncActivities);

// GET /activities/sync/stream
router.get("/sync/stream", requireAuth, syncActivitiesStream);

export default router;
