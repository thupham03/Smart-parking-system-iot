import { Router } from "express";
import {
  viewAnalytics,
  viewCar,
  viewHome,
  viewLogs,
  viewParking,
  viewUsers,
} from "../controllers/views.controller";
const viewsRoute = Router();
viewsRoute.get("/", viewHome);

viewsRoute.get("/cars", viewCar);

viewsRoute.get("/parking", viewParking);

viewsRoute.get("/users", viewUsers);

viewsRoute.get("/analytics", viewAnalytics);

viewsRoute.get("/logs", viewLogs);

export default viewsRoute;
