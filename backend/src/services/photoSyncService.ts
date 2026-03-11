import { EventEmitter } from "events";
import { RateLimitError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { StravaService } from "./stravaServices";

// Singleton EventEmitter to communicate between the job and the SSE controller
// Each user have its own channel : `photo-sync-<userId>`
export const photoSyncEmitter = new EventEmitter();

export type PhotoSyncEvent =
  | { type: "started"; data: { total: number } }
  | {
      type: "processing_activity";
      data: { processed: number; total: number; activityId: number };
    }
  | {
      type: "paused";
      data: { processed: number; total: number; resumeAt: string };
    }
  | { type: "resumed"; data: { processed: number; total: number } }
  | {
      type: "completed";
      data: { processedActivities: number; totalPhotos: number };
    }
  | { type: "error"; data: { message: string } };

const stravaService = new StravaService();

export class PhotoSyncService {
  async startPhotoSync(userId: string): Promise<void> {
    // Verify current state to avoid lauching multiple jobs in parallel
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { photoSyncStatus: true, stravaAccessToken: true },
    });

    if (!user?.stravaAccessToken) {
      throw new Error("Strava token not found");
    }

    // If a job is already running, do nothing
    if (user.photoSyncStatus === "IN_PROGRESS") {
      logger.warn(`Photo sync already in progress for user ${userId}`);
      return;
    }

    // Launch the job
    this.runPhotoSyncJob(userId).catch((error) => {
      logger.error(`Unhandled error in photo sync job for user ${userId}:`, {
        error,
      });
    });
  }

  // Status reading from DB to SSE reconnection or polling
  async getPhotoSyncStatus(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        photoSyncStatus: true,
        photoSyncProgress: true,
        photoSyncTotal: true,
        photoSyncResumeAt: true,
      },
    });
  }

  // Main job function
  private async runPhotoSyncJob(userId: string): Promise<void> {
    try {
      // 1. Load Strava token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stravaAccessToken: true },
      });

      if (!user?.stravaAccessToken) {
        throw new Error("Strava token not found");
      }

      // 2. Find all activities containing photos and non treated yet
      const activities = await prisma.activity.findMany({
        where: {
          trailFramesUserId: userId,
          totalPhotoCount: { gt: 0 },
          photosLastFetchedAt: null, // null = not treated yet
        },
        select: { stravaActivityId: true },
        orderBy: { startDate: "desc" },
      });

      const total = activities.length;

      // Limit case : no activity to process
      if (total === 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { photoSyncStatus: "COMPLETED" },
        });
        this.emit(userId, {
          type: "completed",
          data: { processedActivities: 0, totalPhotos: 0 },
        });
        return;
      }

      // 3. Init status in DB
      await prisma.user.update({
        where: { id: userId },
        data: {
          photoSyncStatus: "IN_PROGRESS",
          photoSyncTotal: total,
          photoSyncProcessed: 0,
          photoSyncResumeAt: null,
        },
      });

      this.emit(userId, { type: "started", data: { total } });
      logger.info(
        `Photo sync started for user ${userId} - ${total} activities to process`,
      );

      let processed = 0;
      let totalPhotos = 0;

      // 4. Main loop - one Strava API call per activity
      for (const activity of activities) {
        const activityId = Number(activity.stravaActivityId);

        const { photos, rateLimitUsage, rateLimitLimit } =
          await stravaService.getActivityPhotos(
            user.stravaAccessToken,
            activityId,
          );

        // Stock photos in DB (upsert for idempotence)
        if (photos.length > 0) {
          await prisma.photo.createMany({
            data: photos.map((photo) => ({
              stravaUniqueId: photo.unique_id,
              stravaActivityId: activity.stravaActivityId,
              url: photo.urls["2048"] ?? Object.values(photo.urls)[0], // fallback to any available size
              caption: photo.caption ?? null,
              location: photo.location
                ? [photo.location[0], photo.location[1]]
                : [],
              stravaUploadedAt: new Date(photo.uploaded_at),
              stravaCreatedAt: new Date(photo.created_at),
              stravaCreatedAtLocal: new Date(photo.created_at_local),
            })),
            skipDuplicates: true, // avoid errors in case of retry or duplicate photos
          });
          totalPhotos += photos.length;
        }

        // Mark activity as treated
        await prisma.activity.update({
          where: { stravaActivityId: activity.stravaActivityId },
          data: { photosLastFetchedAt: new Date() },
        });

        processed++;

        // Update DB counter
        await prisma.user.update({
          where: { id: userId },
          data: { photoSyncProcessed: processed },
        });

        // 5. Verify rate limit BEFORE sending the next request
        // 10 buffer : we stop at 190/200 to never hit the limit
        const RATE_LIMIT_BUFFER = 10;
        const isNearLimit =
          rateLimitUsage.fifteenMin >=
          rateLimitLimit.fifteenMin - RATE_LIMIT_BUFFER;

        if (isNearLimit && processed < total) {
          await this.pauseAndScheduleResume(userId, processed, total);
          return; // Go out of the loop - job will be resumed via setTimeout
        }
      }

      // 6. All activities processed
      await prisma.user.update({
        where: { id: userId },
        data: { photoSyncStatus: "COMPLETED" },
      });

      this.emit(userId, {
        type: "completed",
        data: { processedActivities: processed, totalPhotos },
      });

      logger.info(
        `Photo sync completed for user ${userId} - ${processed} activities, ${totalPhotos} photos`,
      );
    } catch (error) {
      // In case RateLimitError
      if (error instanceof RateLimitError) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { photoSyncProcessed: true, photoSyncTotal: true },
        });

        await this.pauseAndScheduleResume(
          userId,
          user?.photoSyncProcessed ?? 0,
          user?.photoSyncTotal ?? 0,
          error.retryAfterMs,
        );
        return;
      }

      const message = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Photo sync job failed for user ${userId}: ${message}`);

      await prisma.user.update({
        where: { id: userId },
        data: { photoSyncStatus: "ERROR" },
      });

      this.emit(userId, { type: "error", data: { message } });
    }
  }

  private async pauseAndScheduleResume(
    userId: string,
    processed: number,
    total: number,
    retryAfterMs?: number,
  ): Promise<void> {
    // Compute duration until next 15min window if not provided
    const waitMs = retryAfterMs ?? this.msUntilNextRateLimitWindow();
    const resumeAt = new Date(Date.now() + waitMs);

    await prisma.user.update({
      where: { id: userId },
      data: { photoSyncStatus: "PAUSED", photoSyncResumeAt: resumeAt },
    });

    this.emit(userId, {
      type: "paused",
      data: { processed, total, resumeAt: resumeAt.toISOString() },
    });

    logger.info(
      `Photo sync paused for user ${userId} - resuming at ${resumeAt.toISOString()}`,
    );

    // Schedule the automatic resume
    setTimeout(() => {
      this.runPhotoSyncJob(userId).catch((error) =>
        logger.error(`Error resuming photo sync job for user ${userId}`, {
          error,
        }),
      );
    }, waitMs);
  }

  // Time in ms until the next Strava window (:00, :15, :30, :45)
  private msUntilNextRateLimitWindow(): number {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const nextWindowMinutes = Math.ceil(minutes + 1 / 15) * 15;
    const minutesToWait = nextWindowMinutes - minutes;
    return minutesToWait * 60 * 1000 - seconds * 1000;
  }

  // Helper to emit events on user specific channel
  private emit(userId: string, event: PhotoSyncEvent): void {
    photoSyncEmitter.emit(`photo-sync-${userId}`, event);
  }
}

export const photoSyncService = new PhotoSyncService();
