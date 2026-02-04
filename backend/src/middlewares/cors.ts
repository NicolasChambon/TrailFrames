import cors, { type CorsOptions } from "cors";
import { config } from "@/config";
import { logger } from "@/lib/logger";

/**
 * Application CORS options
 *
 * - origin: Dynamic origin verification function
 * - credentials: Allow cookies to be sent (necessary for JWT in httpOnly cookies)
 */
export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Debug log for origin checks
    logger.debug("CORS origin check", {
      receivedOrigin: origin || "no-origin",
      allowedOrigins: config.allowedOrigins,
    });

    // If no origin provided we allow requests only in non-production environments
    if (!origin) {
      return callback(null, !config.isProduction);
    }

    // If origin is in the allowed list, allow the request
    if (config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // If origin is not allowed, reject the request
    logger.error("CORS rejected origin", {
      receivedOrigin: origin,
      allowedOrigins: config.allowedOrigins,
      isProduction: config.isProduction,
    });
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Authorize cookies (required for JWT in httpOnly cookies)
};

// Configurated CORS middleware
export const corsMiddleware = cors(corsOptions);
