import { Request, Response, NextFunction } from "express";
import z from "zod";
import { BadRequestError } from "@/lib/errors";
import { ActivitiesService } from "@/services/activitiesService";

const activitiesService = new ActivitiesService();
export class ActivitiesController {
  // PUT /activities/:trailFramesUserId
  async syncActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        trailFramesUserId: z.string().min(1),
      });

      const parseResult = paramsSchema.safeParse(req.params);

      if (!parseResult.success) {
        throw new BadRequestError(parseResult.error.message);
      }

      const { trailFramesUserId } = parseResult.data;

      await activitiesService.createAllActivities(trailFramesUserId);

      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
