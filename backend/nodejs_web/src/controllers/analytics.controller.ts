import { Request, Response } from "express";
import Car from "../models/car.model";
import Parking from "../models/parkingSlot.model";

export const getAnalyticsData = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    let dateFilter = {};

    if (range === "daily") {
      dateFilter = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    } else if (range === "weekly") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      dateFilter = { $gte: startOfWeek };
    } else if (range === "monthly") {
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );
      dateFilter = { $gte: startOfMonth };
    }

    const totalCars = await Car.countDocuments();
    const totalSlots = await Parking.countDocuments(); // Fetch total number of parking slots dynamically
    const occupiedSpots = await Parking.countDocuments({
      status_slot: true,
    });
    const availableSpots = totalSlots - occupiedSpots;
    const carEntries = await Car.find({
      entry_time: dateFilter,
    }).countDocuments();
    const carExits = await Car.find({
      exit_time: dateFilter,
    }).countDocuments();

    const data = {
      totalCars,
      availableSpots,
      carEntries,
      carExits,
    };
    res.json(data);
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
