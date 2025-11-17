import { Request, Response, NextFunction } from "express";
import z from "zod";
import { BadRequestError } from "@/lib/errors";
import { AntivitiesService } from "@/services/activitiesService";

const activitiesService = new AntivitiesService();

export class ActivitiesController {
  // PUT /activities/:userId
  async registerAllActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        userId: z.string().min(1),
      });

      const parseResult = paramsSchema.safeParse(req.params);

      if (!parseResult.success) {
        throw new BadRequestError(parseResult.error.message);
      }

      const { userId } = parseResult.data;

      const result = await activitiesService.createAllActivities(userId);

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
