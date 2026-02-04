import "dotenv/config";
import { createApp } from "@/app";
import { config } from "@/config";
import { startCleanupJobs } from "@/jobs/cleanupJobs";
import { logger } from "@/lib/logger";

// Create configured Express app instance
const app = createApp();

// Start cleanup jobs (e.g. expired token cleanup)
startCleanupJobs();

// Start the HTTP server
app.listen(config.port, () => {
  logger.info(`🚀 Server running on http://localhost:${config.port}`, {
    port: config.port,
    environment: config.nodeEnv,
  });
});
