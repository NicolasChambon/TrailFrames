import { Request, Response } from "express";
import { logger } from "@/lib/logger";
import { createSseWriter, setSseHeaders } from "@/lib/sse";
import { PhotosService } from "@/services/photosService";
import {
  photoSyncEmitter,
  PhotoSyncEvent,
  photoSyncService,
} from "@/services/photoSyncService";

const photosService = new PhotosService();

// POST /activities/photos/sync
// Launch job in fire & forget, answer immediately 202
export const startPhotoSync = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // startPhotoSync is non blocking: job progress in background
    await photoSyncService.startPhotoSync(userId);

    res.status(202).json({ success: true, message: "Photo sync started" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error starting photo sync", {
      userId: req.user?.userId,
      error: message,
    });

    res.status(500).json({ success: false, error: message });
  }
};

// GET /activities/photos/sync/stream
// Persistant SSE connection - emit events from the job in real time
export const photoSyncStream = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user!.userId;
  const channel = `photo-sync-${userId}`;

  // SSE headers configuration
  setSseHeaders(res);

  // Helper function to send SSE events to the client
  const sendEvent = createSseWriter<PhotoSyncEvent>(res);

  // At reconnection, immediately send the current status from the DB
  // This ensure frontend knows where we are without waiting for the next job event
  const currentStatus = await photoSyncService.getPhotoSyncStatus(userId);
  if (currentStatus) {
    res.write(
      `data: ${JSON.stringify({ type: "status", ...currentStatus })}\n\n`,
    );
  }

  // Listen to job events
  const onEvent = (event: PhotoSyncEvent) => {
    sendEvent(event);

    // Close SSE connection when job is completed or on error
    if (event.type === "completed" || event.type === "error") {
      res.end();
      photoSyncEmitter.off(channel, onEvent);
    }
  };

  photoSyncEmitter.on(channel, onEvent);

  // Clean up listener on client disconnect
  req.on("close", () => {
    photoSyncEmitter.off(channel, onEvent);
  });
};

// GET /activities/photos/sync/status
// Simple status reading from DB - for SWR if SSE is closed
export const getPhotoSyncStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const status = await photoSyncService.getPhotoSyncStatus(userId);

    res.json({ success: true, data: status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
};

// GET /activities/photos
// Paginated photos list with parent activity name and date
// TODO: add query params for pagination, filtering, sorting (linked to the endpoint implementation)
export const getPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(1, parseInt(req.query.limit as string) || 50),
    );

    const data = await photosService.getPhotos(userId, page, limit);

    res.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
};
