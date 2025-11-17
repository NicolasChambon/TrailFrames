import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./lib/errors";
import routes from "./routes";

dotenv.config({ path: ".env.development.local" });

const app = express();
const PORT = process.env.BACKEND_PORT;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
});
