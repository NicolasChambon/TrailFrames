import { Router } from "express";
import activitiesRoutes from "./activities";
import authRoutes from "./auth";

const router = Router();

router.use("/auth", authRoutes);
router.use("/activities", activitiesRoutes);

export default router;
