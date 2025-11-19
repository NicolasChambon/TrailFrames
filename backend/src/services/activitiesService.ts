import { User } from "@/generated/prisma";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SummaryActivity } from "@/types/strava";
import { StravaService } from "./stravaServices";

const stravaService = new StravaService();

export class AntivitiesService {
  async createAllActivities(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const allActivities = await this.fetchAllStravaActivities(user.accessToken);
    await this.saveActivitiesToDb(user, allActivities);
  }

  private async getUserOrThrow(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
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
    const createdActivities = [];

    for (const activity of activities) {
      const sportType = await prisma.sportType.upsert({
        where: { name: activity.sport_type },
        update: {},
        create: { name: activity.sport_type },
      });

      const isActivityExisting = await prisma.activity.findUnique({
        where: { stravaActivityId: activity.id },
      });

      if (isActivityExisting) {
        console.info(
          `Activity with Strava ID ${activity.id} already exists. Skipping creation.`
        );
        continue;
      }

      const createdActivity = await prisma.activity.create({
        data: {
          stravaActivityId: activity.id,
          userId: user.id,
          stravaUserId: activity.athlete.id,
          stravaExternalId: activity.external_id ?? null,
          stravaUploadId: activity.upload_id ?? null,
          name: activity.name,
          distance: activity.distance,
          movingTime: activity.moving_time,
          elapsedTime: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          elevHigh: activity.elev_high ?? null,
          elevLow: activity.elev_low ?? null,
          sportTypeId: sportType.id,
          startDate: new Date(activity.start_date),
          startDateLocal: new Date(activity.start_date_local),
          timezone: activity.timezone,
          startLatlng: activity.start_latlng ?? [],
          endLatlng: activity.end_latlng ?? [],
          achievementCount: activity.achievement_count,
          kudosCount: activity.kudos_count,
          commentCount: activity.comment_count,
          athleteCount: activity.athlete_count,
          photoCount: activity.photo_count,
          totalPhotoCount: activity.total_photo_count,
          polyline: activity.map.polyline ?? null,
          summaryPolyline: activity.map.summary_polyline ?? null,
          trainer: activity.trainer,
          commute: activity.commute,
          manual: activity.manual,
          private: activity.private,
          flagged: activity.flagged,
          workoutType: activity.workout_type ?? null,
          stravaUploadIdStr: activity.upload_id_str ?? null,
          averageSpeed: activity.average_speed,
          maxSpeed: activity.max_speed,
          hasKudoed: activity.has_kudoed,
          hideFromHome: activity.hide_from_home ?? null,
          gearId: activity.gear_id ?? "",
          kilojoules: activity.kilojoules ?? 0,
          averageWatts: activity.average_watts ?? 0,
          deviceWatts: activity.device_watts ?? null,
          maxWatts: activity.max_watts ?? 0,
          weightedAverageWatts: activity.weighted_average_watts ?? 0,
        },
      });

      createdActivities.push(createdActivity);
    }

    console.info(
      `Successfully created ${createdActivities.length} activities in database`
    );

    return createdActivities;
  }
}
