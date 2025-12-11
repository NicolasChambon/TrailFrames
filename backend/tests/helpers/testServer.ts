import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import express, { Express } from "express";
import helmet from "helmet";
import { errorHandler } from "@/lib/errors";
import { csrfErrorHandler, getCsrfToken } from "@/middlewares/csrf";
import routes from "@/routes";

/**
 * Create an Express instance configured for testing
 * IMPORTANT: This function must be called once by test suite
 * (in a describe) to garantee CSRF secret remains coherent.
 */
export function createTestApp(): Express {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: true, // Allow all origins in tests
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", message: "Test backend is running" });
  });

  // CSRF configuration for tests
  // We create one dedicated instance by app to have stable secret
  const csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: false, // false for tests (non-HTTPS)
      sameSite: "lax",
    },
  });

  // CSRF token endpoint - must be before global middleware application
  app.get("/csrf-token", csrfProtection, getCsrfToken);

  // Apply CSRF protection to all routes
  app.use(csrfProtection);

  // Routes
  app.use(routes);

  // Error handlers
  app.use(csrfErrorHandler);
  app.use(errorHandler);

  return app;
}
