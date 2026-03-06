import cookieParser from "cookie-parser";
import express, { type Express } from "express";
import helmet from "helmet";
import { config } from "@/config";
import { errorHandler } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { corsMiddleware } from "@/middlewares/cors";
import {
  csrfErrorHandler,
  csrfProtection,
  getCsrfToken,
} from "@/middlewares/csrf";
import apiRoutes from "@/routes";
import publicRoutes from "@/routes/public";

/**
 * Create and configure the Express application
 *
 * @returns Configured Express app instance
 */
export function createApp(): Express {
  const app = express();

  // Helmet : Securise HTTP headers
  app.use(helmet());

  // CORS configuration logging at startup (debugging)
  logger.info("CORS configuration", {
    allowedOrigins: config.allowedOrigins,
    isProduction: config.isProduction,
    nodeEnv: config.nodeEnv,
  });

  // Public routes (no auth, no CSRF, no CORS restrictions)
  app.use(publicRoutes);

  // CORS middleware
  app.use(corsMiddleware);

  // Necessary to read cookies (e.g. JWT in httpOnly cookies)
  app.use(cookieParser());

  // Transform req.body to JavaScript object
  app.use(express.json());

  // Endpoint to get CSRF token
  // Frontend must first call GET /csrf-token to get a token
  // which it must then send in all mutating requests.
  app.get("/csrf-token", csrfProtection, getCsrfToken);

  // Apply CSRF protection only on mutating requests
  app.use((req, res, next) => {
    const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (mutatingMethods.includes(req.method)) {
      return csrfProtection(req, res, next);
    }

    // GET, HEAD, OPTIONS → no CSRF protection needed
    next();
  });

  // Mount main API routes
  app.use(apiRoutes);

  // CSRF error handler
  app.use(csrfErrorHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}
