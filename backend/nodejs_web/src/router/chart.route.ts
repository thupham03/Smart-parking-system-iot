import { Router } from "express";
import { getChartData } from "../controllers/chart.controller";

const chartRoutes = Router();

chartRoutes.get('/data', getChartData);

export default chartRoutes;

