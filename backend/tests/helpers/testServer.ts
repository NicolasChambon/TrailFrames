import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { errorHandler } from "@/lib/errors";
import {
  csrfErrorHandler,
  csrfProtection,
  getCsrfToken,
} from "@/middlewares/csrf";
import routes from "@/routes";

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

  // CSRF token
  app.get("/csrf-token", csrfProtection, getCsrfToken);

  // Apply CSRF protection
  app.use(csrfProtection);

  // Routes
  app.use(routes);

  // Error handlers
  app.use(csrfErrorHandler);
  app.use(errorHandler);

  return app;
}
