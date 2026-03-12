import { Request, Response } from "express";
import { logger } from "@/lib/logger";
import { createSseWriter, setSseHeaders } from "@/lib/sse";
import {
  ActivitiesService,
  ProgressCallback,
  ProgressEvent,
} from "@/services/activitiesService";

const activitiesService = new ActivitiesService();

// GET /activities/sync/stream
export const syncActivitiesStream = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // SSE headers configuration
    setSseHeaders(res);

    // Helper function to send SSE events to the client
    const sendEvent = createSseWriter<ProgressEvent>(res);

    // Progression callback passed to the service
    const onProgress: ProgressCallback = (event) => {
      sendEvent(event);
    };

    // Synchronization launching with callback
    await activitiesService.syncActivitiesWithProgress(userId, onProgress);

    // Connection ending
    res.end();
  } catch (error) {
    // Send error via SSE before ending the connection
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    res.write(
      `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`,
    );

    res.end();

    // Log error for server-side tracking
    logger.error("Error during activities sync stream", {
      userId: req.user?.userId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
