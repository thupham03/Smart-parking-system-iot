import { Router } from "express";
import { getLogs } from "../controllers/views.controller";

const router = Router();

router.get("/", getLogs);

export default router;
