import { NextFunction, Request, Response } from "express";
import { logError } from "./logger";

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class BadRequestError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _: NextFunction
) {
  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  // Don't log 401 errors on auth check endpoint - it's a normal case for unauthenticated users
  const isAuthCheck =
    req.originalUrl.includes("/auth/current-user") && statusCode === 401;

  if (!isAuthCheck) {
    logError(error, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user?.userId,
    });
  }

  const response: { success: false; error: string; details?: string } = {
    success: false,
    error:
      statusCode === 500
        ? "An unexpected error occurred. Please try again later."
        : error.message,
  };

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.details = error.stack;
  }

  res.status(statusCode).json(response);
}
