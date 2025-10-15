import { Router } from "express";
import {
  addCar,
  getAllCars,
  updateCar,
  deleteCar,
  carEvent,
  checkRFID,
} from "../controllers/car.controller";
import { checkCarIsParking } from "../middlewares/car.middleware";

const carRoutes = Router();

carRoutes.post("/", checkCarIsParking, addCar);
carRoutes.get("/", getAllCars);
carRoutes.put("/:plate_number", updateCar);
carRoutes.delete("/:plate_number", deleteCar);

carRoutes.post("/event", carEvent);
carRoutes.post("/check-rfid", checkRFID);

export default carRoutes;
