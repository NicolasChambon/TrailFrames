import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth";

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

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
