import { Router } from "express";
import { getAnalyticsData } from "../controllers/analytics.controller";

const analyticsRoutes = Router();

analyticsRoutes.get("/data", getAnalyticsData);

export default analyticsRoutes;

