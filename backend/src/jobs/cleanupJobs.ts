import { logger } from "@/lib/logger";
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
