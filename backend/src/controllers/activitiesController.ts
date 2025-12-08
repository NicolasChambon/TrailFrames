import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@/lib/errors";
import { ActivitiesService } from "@/services/activitiesService";

const activitiesService = new ActivitiesService();

// PUT /activities/:trailFramesUserId
export async function syncActivities(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    await activitiesService.createAllActivities(req.user);

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
