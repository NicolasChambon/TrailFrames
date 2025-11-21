import { User } from "@/generated/prisma";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SummaryActivity } from "@/types/strava";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class AntivitiesService {
  async createAllActivities(trailFramesUserId: string) {
    const user = await this.getUserOrThrow(trailFramesUserId);
    const allActivities = await this.fetchAllStravaActivities(user.accessToken);
    await this.saveActivitiesToDb(user, allActivities);
  }

  private async getUserOrThrow(trailFramesUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: trailFramesUserId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (new Date() > user.expiresAt) {
      throw new UnauthorizedError("Access token expired");
    }
    return user;
  }

  private async fetchAllStravaActivities(
    accessToken: string
  ): Promise<SummaryActivity[]> {
    const allActivities: SummaryActivity[] = [];

    let page = 1;
    const perPage = 200;
    let hasMoreActivities = true;

    while (hasMoreActivities) {
      const activities = await stravaService.getActivities({
        accessToken,
        page,
        perPage,
      });

      if (activities.length === 0) {
        hasMoreActivities = false;
      } else {
        allActivities.push(...activities);
        console.info(`Fetched page ${page}: ${activities.length} activities`);

        if (activities.length < perPage) {
          hasMoreActivities = false;
        } else {
          page++;
        }
      }
    }

    console.info(`Total activities fetched: ${allActivities.length}`);
    return allActivities;
  }

  private async saveActivitiesToDb(user: User, activities: SummaryActivity[]) {
    console.info(
      `Starting to save ${activities.length} activities to database`
    );

    const stravaActivityIds = activities.map((activity) => activity.id);
    const existingActivities = await prisma.activity.findMany({
      where: { stravaActivityId: { in: stravaActivityIds } },
      select: { stravaActivityId: true },
    });
    const existingActivityIds = new Set(
      existingActivities.map((a) => a.stravaActivityId)
    );

    console.info(
      `Found ${existingActivityIds.size} activities already in database`
    );

    const activitiesToCreate = activities.filter(
      (activity) => !existingActivityIds.has(BigInt(activity.id))
    );

    if (activitiesToCreate.length === 0) {
      console.info("No new activities to create");
      return [];
    }

    console.info(`Creating ${activitiesToCreate.length} new activities`);

    const activitiesData = activitiesToCreate.map((activity) => ({
      stravaActivityId: activity.id,
      trailFramesUserId: user.id,
      stravaAthleteId: activity.athlete.id,
      stravaUploadId: activity.upload_id ?? null,
      name: activity.name,
      distance: activity.distance,
      movingTime: activity.moving_time,
      elapsedTime: activity.elapsed_time,
      totalElevationGain: activity.total_elevation_gain,
      elevHigh: activity.elev_high ?? null,
      elevLow: activity.elev_low ?? null,
      sportType: activity.sport_type,
      startDate: new Date(activity.start_date),
      startDateLocal: new Date(activity.start_date_local),
      timezone: activity.timezone,
      startLatlng: activity.start_latlng ?? [],
      endLatlng: activity.end_latlng ?? [],
      achievementCount: activity.achievement_count,
      kudosCount: activity.kudos_count,
      commentCount: activity.comment_count,
      athleteCount: activity.athlete_count,
      totalPhotoCount: activity.total_photo_count,
      summaryPolyline: activity.map.summary_polyline ?? null,
      trainer: activity.trainer,
      commute: activity.commute,
      manual: activity.manual,
      private: activity.private,
      flagged: activity.flagged,
      workoutType: activity.workout_type ?? null,
      averageSpeed: activity.average_speed,
      maxSpeed: activity.max_speed,
      hasKudoed: activity.has_kudoed,
      gearId: activity.gear_id ?? null,
      kilojoules: activity.kilojoules ?? null,
      averageWatts: activity.average_watts ?? null,
      deviceWatts: activity.device_watts ?? null,
      maxWatts: activity.max_watts ?? null,
      weightedAverageWatts: activity.weighted_average_watts ?? null,
    }));

    const result = await prisma.activity.createMany({
      data: activitiesData,
      skipDuplicates: true,
    });

    console.info(`Successfully created ${result.count} activities in database`);

    return result;
  }
}
