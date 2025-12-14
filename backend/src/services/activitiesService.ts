import { UnauthorizedError } from "@/lib/errors";
import { JwtPayload } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SummaryActivity } from "@/types/strava";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class ActivitiesService {
  async createAllActivities(userPayload: JwtPayload) {
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
    });

    if (!user?.stravaAccessToken) {
      throw new UnauthorizedError("User does not have a Strava access token");
    }

    const allActivities = await this.fetchAllStravaActivities(
      user.stravaAccessToken
    );

    await this.saveActivitiesToDb(userPayload, allActivities);
  }

  private async fetchAllStravaActivities(
    encryptedStravaAccessToken: string
  ): Promise<SummaryActivity[]> {
    const allActivities: SummaryActivity[] = [];

    let page = 1;
    const perPage = 200;
    let shouldFetchMore = true;

    while (shouldFetchMore) {
      const activities = await stravaService.getActivities({
        encryptedStravaAccessToken,
        page,
        perPage,
      });

      if (activities.length === 0) {
        shouldFetchMore = false;
      } else {
        allActivities.push(...activities);
        logger.info(`Fetched page ${page}: ${activities.length} activities`);

        if (activities.length < perPage) {
          shouldFetchMore = false;
        } else {
          page++;
        }
      }
    }

    logger.info(`Total activities fetched: ${allActivities.length}`);
    return allActivities;
  }

  private async saveActivitiesToDb(
    user: JwtPayload,
    activities: SummaryActivity[]
  ) {
    logger.info(`Starting to save ${activities.length} activities to database`);

    const stravaActivityIds = activities.map((activity) => activity.id);
    const existingActivities = await prisma.activity.findMany({
      where: { stravaActivityId: { in: stravaActivityIds } },
      select: { stravaActivityId: true },
    });
    const existingActivityIds = new Set(
      existingActivities.map((activity) => activity.stravaActivityId)
    );

    logger.info(
      `Found ${existingActivityIds.size} activities already in database`
    );

    const activitiesToCreate = activities.filter(
      (activity) => !existingActivityIds.has(BigInt(activity.id))
    );

    if (activitiesToCreate.length === 0) {
      logger.info("No new activities to create");
      return [];
    }

    logger.info(`Creating ${activitiesToCreate.length} new activities`);

    const activitiesData = activitiesToCreate.map((activity) => ({
      stravaActivityId: activity.id,
      trailFramesUserId: user.userId,
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

    logger.info(`Successfully created ${result.count} activities in database`);

    return result;
  }
}
