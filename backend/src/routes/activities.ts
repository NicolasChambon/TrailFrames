import { Router } from "express";
import { syncActivities } from "@/controllers/activitiesController";
import { requireAuth } from "@/middlewares/auth";

const router = Router();

// PUT /activities
router.put("/:trailFramesUserId", requireAuth, syncActivities);

export default router;
