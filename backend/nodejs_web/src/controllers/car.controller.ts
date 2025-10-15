import { Request, Response } from "express";
import Car from "../models/car.model";
import Logs from "../models/logs.model";
import ParkingSlot from "../models/parkingSlot.model";
import logger from "../services/logger.service";
import { addLogJob, addCarCleanupJob } from "../services/queue.service";

// ================== TÍNH TIỀN ==================
const calculatePrice = (entry: Date, exit: Date): number => {
  if (!entry || !exit) return 0;
  if (exit < entry) return 0;
  if (entry.toDateString() !== exit.toDateString()) {
    const days = Math.ceil(
      (exit.getTime() - entry.getTime()) / (1000 * 3600 * 24)
    );
    return days * 10000;
  }
  return 5000;
};

// ================== CRUD CƠ BẢN ==================
export const addCar = async (req: Request, res: Response) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).json({ message: "Xe đã được lưu thành công!" });
  } catch (err: any) {
    logger.error(`❌ addCar error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

export const getAllCars = async (req: Request, res: Response) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (err: any) {
    logger.error(`❌ getAllCars error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const updateCar = async (req: Request, res: Response) => {
  const { plate_number } = req.params;
  try {
    await Car.updateOne({ plate_number }, req.body);
    res.status(200).json({ message: "Trạng thái xe đã được cập nhật!" });
  } catch (err: any) {
    logger.error(`❌ updateCar error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  const { plate_number } = req.params;
  try {
    await Car.deleteOne({ plate_number });
    res.status(200).json({ message: "Xe đã được xóa thành công!" });
  } catch (err: any) {
    logger.error(`❌ deleteCar error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const carEvent = async (req: Request, res: Response): Promise<void> => {
  const { plate_number, camera_id, event, video_filename } = req.body;
  const io = req.app.get("io");

  try {
    if (!plate_number) {
      await Logs.create({
        plate_number: "unknown",
        status: false,
        event: "invalid_plate",
      });
      io.emit("alert_event", {
        type: "invalid_plate",
        msg: "Biển số không hợp lệ",
      });
      res.status(400).json({ message: "Invalid plate" });
      return;
    }

    let car = await Car.findOne({ plate_number }).sort({ created_at: -1 });

    // 🚘 XE VÀO
    if (event === "in") {
      const totalSlots = await ParkingSlot.countDocuments();
      const occupiedSlots = await ParkingSlot.countDocuments({
        status_slot: true,
      });

      if (occupiedSlots >= totalSlots) {
        io.emit("alert_event", { type: "parking_full", msg: "Bãi xe đã đầy" });
        await Logs.create({
          plate_number,
          event: "parking_full",
          timestamp: new Date(),
        });
        res
          .status(400)
          .json({ message: "Bãi xe đã đầy, không thể thêm xe mới" });
        return;
      }

      if (car && car.status === true) {
        io.emit("alert_event", { type: "duplicate_in", plate_number });
        await Logs.create({
          plate_number,
          event: "duplicate_in",
          timestamp: new Date(),
        });
        res.status(400).json({ message: "Xe đang đỗ, không thể vào lại" });
        return;
      }

      car = await Car.create({
        plate_number,
        entry_time: new Date(),
        status: false,
        video_filename,
        camera_id,
      });

      await Logs.create({
        car_id: car._id,
        plate_number: car.plate_number,
        event: "in",
        timestamp: new Date(),
      });

      io.emit("car_event", { plate_number, event: "pending" });

      setTimeout(async () => {
        try {
          const check = await Car.findById(car?._id);
          if (check && !check.rfid && check.status === false) {
            await Car.deleteOne({ _id: check._id });
            io.emit("alert_event", { type: "rfid_missing", plate_number });
            await Logs.create({
              plate_number,
              event: "rfid_missing",
              timestamp: new Date(),
            });
          }
        } catch (err: any) {
          logger.error(`rfid_missing timeout error: ${err.message}`);
        }
      }, 10000);
    }

    if (event === "out" && car && car.status === true) {
      const exit_time = new Date();
      const price = calculatePrice(car.entry_time!, exit_time);

      car.exit_time = exit_time;
      car.status = false;
      car.price = price;
      await car.save();

      await ParkingSlot.updateOne(
        { license_plate: plate_number },
        { status_slot: false, license_plate: null }
      );

      io.emit("car_event", { plate_number, event: "out", price });

      await Logs.create({
        car_id: car._id,
        plate_number: car.plate_number,
        event: "out",
        timestamp: new Date(),
      });
    }

    await Logs.create({ car_id: car?._id, plate_number, event });
    res.json({ message: "Car event processed", car });
  } catch (err: any) {
    logger.error(`carEvent error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const checkRFID = async (req: Request, res: Response): Promise<void> => {
  const { plate_number, rfid } = req.body;
  const io = req.app.get("io");

  try {
    const car = await Car.findOne({ plate_number }).sort({ created_at: -1 });

    if (!car) {
      io.emit("alert_event", { type: "rfid_invalid", plate_number, rfid });
      res.status(404).json({ message: "Không tìm thấy xe" });
      return;
    }

    if (car.status === true) {
      res.json({ message: "Xe đã được xác nhận trước đó" });
      return;
    }

    car.rfid = rfid;
    car.status = true;
    await car.save();

    io.emit("car_event", { plate_number, event: "in" }); // ✅ chính thức “in” khi có RFID
    io.emit("rfid_event", { plate_number, rfid });

    res.json({ message: "RFID confirmed", car });
  } catch (err: any) {
    logger.error(`checkRFID error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
