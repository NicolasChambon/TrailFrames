import { Response } from "express";

export const setSseHeaders = (res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream"); // SSE standard
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); // Keep connection alive
  res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for Nginx
};

export const createSseWriter = <
  T extends { type: string; data: Record<string, unknown> },
>(
  res: Response,
) => {
  return (event: T): void => {
    const message = `data: ${JSON.stringify(event)}\n\n`;
    res.write(message);
  };
};
