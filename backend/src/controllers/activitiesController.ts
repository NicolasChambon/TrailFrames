import { Request, Response } from "express";
import { logger } from "@/lib/logger";
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
    res.setHeader("Content-Type", "text/event-stream"); // SSE standard
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive"); // Keep connection alive
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for Nginx

    // Helper function to send SSE events to the client
    const sendEvent = (event: ProgressEvent) => {
      const message = `data: ${JSON.stringify({ type: event.type, ...event.data })}\n\n`;
      res.write(message);
    };

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
