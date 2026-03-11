import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { photoSyncService } from "@/services/photoSyncService";
import { TokenService } from "@/services/tokenService";

const tokenService = new TokenService();

async function cleanExpiredTokens(): Promise<void> {
  try {
    await tokenService.cleanExpiredTokens();
    logger.info("Expired refresh tokens cleaned up");
  } catch (error) {
    logger.error("Error cleaning expired refresh tokens", { error });
  }
}

// Start periodic cleanup jobs
export function startCleanupJobs(): void {
  // Cleanup expired refresh tokens every hour
  const HOUR_IN_MS = 60 * 60 * 1000;

  setInterval(async () => {
    await cleanExpiredTokens();
  }, HOUR_IN_MS);

  logger.info("Cleanup jobs started", {
    tokenCleanupInterval: "1 hour",
  });

  // Note : You can add more cleanup jobs here as needed
}

// At startup, resume photo sync jobs that were paused before server restart
export async function resumePausedPhotoSyncJobs(): Promise<void> {
  try {
    const pausedUsers = await prisma.user.findMany({
      where: { photoSyncStatus: "PAUSED" },
      select: { id: true, photoSyncResumedAt: true },
    });

    if (pausedUsers.length === 0) return;

    logger.info(
      `Found ${pausedUsers.length} paused photo sync job(s) to resume`,
    );

    for (const user of pausedUsers) {
      const now = Date.now();
      const resumeAt = user.photoSyncResumedAt?.getTime() ?? now;
      const delayMs = Math.max(0, resumeAt - now); // 0 if resumeAt is in the past

      setTimeout(() => {
        photoSyncService.startPhotoSync(user.id).catch((error) =>
          logger.error(`Failed to resume photo sync for user ${user.id}`, {
            error,
          }),
        );
      }, delayMs);

      logger.info(
        `Scheduled photo sync resume for user ${user.id} in ${Math.round(delayMs / 1000)}s`,
      );
    }
  } catch (error) {
    logger.error("Failed to resume paused photo sync jobs", { error });
  }
}
