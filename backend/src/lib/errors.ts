import { Request, Response } from "express";

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

export function errorHandler(error: Error, req: Request, res: Response) {
  console.error("Error:", {
    path: req.path,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // Erreur serveur inconnue - message générique
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred. Please try again later.",
  });
}
