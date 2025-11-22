import cors from "cors";
import express from "express";
import "dotenv/config";
import { errorHandler } from "./lib/errors";
import routes from "./routes";

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  process.env.FRONTEND_DEV_URL,
  process.env.FRONTEND_STAGING_URL,
  process.env.FRONTEND_PROD_URL,
].filter(Boolean); // retire les valeurs undefined/vides

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use(routes);

app.use(errorHandler);

app.listen(port, () => {
  console.info(`🚀 Server running on http://localhost:${port}`);
});
