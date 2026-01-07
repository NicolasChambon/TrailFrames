import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "dotenv/config";
import helmet from "helmet";
import { errorHandler } from "./lib/errors";
import { logger } from "./lib/logger";
import {
  csrfErrorHandler,
  csrfProtection,
  getCsrfToken,
} from "./middlewares/csrf";
import routes from "./routes";
import { TokenService } from "./services/tokenService";

const tokenService = new TokenService();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_DEV_URL,
  process.env.FRONTEND_STAGING_URL,
  process.env.FRONTEND_PROD_URL,
].filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

// Log CORS configuration at startup
logger.info("CORS configuration", {
  allowedOrigins,
  isProduction,
  nodeEnv: process.env.NODE_ENV,
});

// Public health check routes BEFORE CORS (for Render and other services)
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "TrailFrames API" });
});
app.get("/health", (_req, res) => {
  logger.debug("Health check performed");
  res.json({ status: "ok", message: "Backend is running" });
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Log each origin check for debugging
      logger.debug("CORS origin check", {
        receivedOrigin: origin || "no-origin",
        allowedOrigins,
      });

      if (
        (!origin && !isProduction) ||
        (origin && allowedOrigins.includes(origin))
      ) {
        return callback(null, true);
      } else {
        logger.error("CORS rejected origin", {
          receivedOrigin: origin || "no-origin",
          allowedOrigins,
          isProduction,
        });
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

// Endpoint to get CSRF token
app.get("/csrf-token", csrfProtection, getCsrfToken);

app.use(csrfProtection);

app.use(routes);

app.use(csrfErrorHandler);
app.use(errorHandler);

setInterval(async () => {
  try {
    await tokenService.cleanExpiredTokens();
    logger.info("Expired refresh tokens cleaned up");
  } catch (error) {
    logger.error("Error cleaning expired refresh tokens", { error });
  }
}, 60 * 60 * 1000); // Every 60 minutes

app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`, {
    port,
    environment: process.env.NODE_ENV || "development",
  });
});
