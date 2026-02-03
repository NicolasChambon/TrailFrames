import { UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { SummaryActivity } from "@/types/strava";
import { StravaService } from "./stravaServices";

export type ProgressEvent =
  | { type: "started"; data: { message: string } }
  | { type: "fetching_page"; data: { page: number; activitiesCount: number } }
  | {
      type: "saving_activities";
      data: { total: number; newActivities: number };
    }
  | { type: "completed"; data: { totalSynced: number; syncedAt: string } }
  | { type: "error"; data: { message: string } };

export type ProgressCallback = (event: ProgressEvent) => void;

const stravaService = new StravaService();

export class ActivitiesService {
  async syncActivitiesWithProgress(
    userId: string,
    onProgress: ProgressCallback,
  ): Promise<void> {
    try {
      // Starting event
      onProgress({
        type: "started",
        data: { message: "Synchronization started..." },
      });

      // 1. Fetch user from DB and validate Strava token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          stravaAccessToken: true,
        },
      });

      if (!user?.stravaAccessToken) {
        throw new UnauthorizedError("Strava token not found");
      }

      // 2. Fetch all activities from Strava with pagination
      let page = 1;
      const perPage = 200;
      let allActivities: SummaryActivity[] = [];
      let hasMore = true;

      while (hasMore) {
        const activities = await stravaService.getActivities({
          encryptedStravaAccessToken: user.stravaAccessToken,
          page,
          perPage,
        });

        // Fetched page event
        onProgress({
          type: "fetching_page",
          data: { page, activitiesCount: activities.length },
        });

        logger.info(
          `Fetched page ${page} with ${activities.length} activities from Strava for user ${user.id}`,
        );

        allActivities = allActivities.concat(activities);
        hasMore = activities.length === perPage;
        page++;
      }

      // 3. Existing activities filtering
      const existingIds = await prisma.activity.findMany({
        where: {
          stravaActivityId: {
            in: allActivities.map((activities) => activities.id),
          },
        },
        select: { stravaActivityId: true },
      });

      const existingIdsSet = new Set(
        existingIds.map((activity) => activity.stravaActivityId),
      );
      const newActivities = allActivities.filter(
        (activity) => !existingIdsSet.has(BigInt(activity.id)),
      );

      // Start saving activities event
      onProgress({
        type: "saving_activities",
        data: {
          total: allActivities.length,
          newActivities: newActivities.length,
        },
      });

      // 4. Save new activities to DB
      if (newActivities.length > 0) {
        await prisma.activity.createMany({
          data: newActivities.map((activity) => ({
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
          })),
          skipDuplicates: true,
        });
      }

      // 5. Update user's lastSyncedAt
      const syncedAt = new Date();
      await prisma.user.update({
        where: { id: userId },
        data: { lastSyncedAt: syncedAt },
      });

      logger.info(
        `Synced ${newActivities.length} new activities for user ${user.id}`,
      );

      // Finished synchronization event
      onProgress({
        type: "completed",
        data: {
          totalSynced: newActivities.length,
          syncedAt: syncedAt.toISOString(),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error during synchronization";

      logger.error(`Sync failed for user ${userId}: ${errorMessage}`);

      onProgress({ type: "error", data: { message: errorMessage } });

      throw error;
    }
  }
}
