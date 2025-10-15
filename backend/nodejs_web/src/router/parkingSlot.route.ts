import { Router } from "express";
import {
  addParkingSlot,
  getAllParkingSlots,
  updateParkingSlot,
  deleteParkingSlot,
  updateSlotStatusBySensor,
  updateSlotByCamera,
} from "../controllers/parkingSlot.controller";

const parkingSlotRoutes = Router();

parkingSlotRoutes.post("/", addParkingSlot);
parkingSlotRoutes.get("/", getAllParkingSlots);
parkingSlotRoutes.put("/:slot_number", updateParkingSlot);
parkingSlotRoutes.delete("/:slot_number", deleteParkingSlot);

parkingSlotRoutes.post("/sensor", updateSlotStatusBySensor);

parkingSlotRoutes.post("/camera", updateSlotByCamera);

export default parkingSlotRoutes;
