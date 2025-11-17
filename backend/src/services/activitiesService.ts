import { prisma } from "@/lib/prisma";
import { StravaService } from "./stravaServices";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

const stravaService = new StravaService();

export class AntivitiesService {
  async createAllActivities(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (new Date() > user.expiresAt) {
      throw new UnauthorizedError("Access token expired");
    }

    const activities = await stravaService.getActivities({
      accessToken: user.accessToken,
      page: 1,
      perPage: 200,
    });

    // Store activities in the database
  }
}
