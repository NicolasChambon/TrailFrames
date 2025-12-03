import { Router } from "express";
import { syncActivities } from "@/controllers/activitiesController";

const router = Router();

// PUT /activities/:trailFramesUserId
router.put("/:trailFramesUserId", syncActivities);

export default router;
