import { RequestHandler } from "express";
import CarModel from "../models/car.model";

export const checkCarIsParking: RequestHandler = async (req, res, next) => {
  const plate = req.body.plate_number as string;

  const car = await CarModel.findOne(
    {
      plate_number: plate,
    },
    {},
    { sort: { created_at: -1 } }
  );

  // Gửi xe trong khi chưa lấy
  if (car && car.status && req.body.status) {
    next("Car is exist!");
    return;
  }

  next();
};
