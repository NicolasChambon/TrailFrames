import { Router } from "express";
import { ActivitiesController } from "@/controllers/activitiesController";

const router = Router();

const activitiesController = new ActivitiesController();

// PUT /activities/:trailFramesUserId
router.put("/:trailFramesUserId", (req, res, next) =>
  activitiesController.syncActivities(req, res, next)
);

export default router;
