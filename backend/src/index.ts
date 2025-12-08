import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "dotenv/config";
import helmet from "helmet";
import { errorHandler } from "./lib/errors";
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        (!origin && !isProduction) ||
        (origin && allowedOrigins.includes(origin))
      ) {
        return callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());

// Public routes BEFORE csrfProtection
// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});
// Endpoint to get CSRF token
app.get("/csrf-token", csrfProtection, getCsrfToken);

app.use(csrfProtection);

app.use(routes);

app.use(csrfErrorHandler);
app.use(errorHandler);

setInterval(async () => {
  try {
    await tokenService.cleanExpiredTokens();
    console.info("Expired refresh tokens cleaned up");
  } catch (error) {
    console.error("Error cleaning expired refresh tokens:", error);
  }
}, 60 * 60 * 1000); // Every 60 minutes

app.listen(port, () => {
  console.info(`🚀 Server running on http://localhost:${port}`);
});
