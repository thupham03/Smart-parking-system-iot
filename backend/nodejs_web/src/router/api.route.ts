import { Router } from "express";
import carRoutes from "./car.route";
import parkingSlotRoutes from "./parkingSlot.route";
import chartRoutes from "./chart.route";
import authRoutes from "./auth.route";
import analyticsRoutes from "./analytics.route";
import logsRoutes from "./logs.route"; // Import logs route

const apiRoute = Router();

apiRoute.use("/cars", carRoutes);
apiRoute.use("/parking-slot", parkingSlotRoutes);
apiRoute.use("/chart", chartRoutes);
apiRoute.use("/analytics", analyticsRoutes);
apiRoute.use("/auth", authRoutes);
apiRoute.use("/logs", logsRoutes); // Add logs route

export default apiRoute;
