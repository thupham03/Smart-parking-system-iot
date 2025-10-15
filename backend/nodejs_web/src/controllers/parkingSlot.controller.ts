import { Request, Response } from "express";
import ParkingSlot from "../models/parkingSlot.model";
import Logs from "../models/logs.model";
import logger from "../services/logger.service";
import { addLogJob } from "../services/queue.service";

export const addParkingSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slot_number } = req.body;

    if (!slot_number) {
      res.status(400).json({ message: "Thiếu slot_number" });
      return;
    }

    const existing = await ParkingSlot.findOne({ slot_number });
    if (existing) {
      res.status(400).json({ message: "Slot đã tồn tại!" });
      return;
    }

    const newSlot = new ParkingSlot(req.body);
    await newSlot.save();

    logger.info(`🅿️ Thêm slot mới: ${slot_number}`);
    res
      .status(201)
      .json({ message: "Vị trí bãi đậu xe đã được lưu thành công!", newSlot });
  } catch (err: any) {
    logger.error(`❌ addParkingSlot error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

export const getAllParkingSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parkingLots = await ParkingSlot.find().sort({ slot_number: 1 });
    res.status(200).json(parkingLots);
  } catch (err: any) {
    logger.error(`❌ getAllParkingSlots error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const updateParkingSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slot_number } = req.params;
  try {
    const updated = await ParkingSlot.findOneAndUpdate(
      { slot_number },
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Không tìm thấy vị trí bãi đậu." });
      return;
    }
    logger.info(`♻️ Cập nhật slot ${slot_number}`);
    res.status(200).json({
      message: "Trạng thái vị trí bãi đậu xe đã được cập nhật!",
      updated,
    });
  } catch (err: any) {
    logger.error(`❌ updateParkingSlot error: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

export const deleteParkingSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { slot_number } = req.params;
  try {
    const deleted = await ParkingSlot.deleteOne({ slot_number });
    if (deleted.deletedCount === 0) {
      res.status(404).json({ message: "Không tìm thấy vị trí cần xóa." });
      return;
    }
    logger.info(`🗑️ Đã xóa slot ${slot_number}`);
    res
      .status(200)
      .json({ message: "Vị trí bãi đậu xe đã được xóa thành công!" });
  } catch (err: any) {
    logger.error(`❌ deleteParkingSlot error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const updateSlotStatusBySensor = async (req: Request, res: Response) => {
  const { slot_number, status_slot } = req.body;
  const io = req.app.get("io");

  try {
    const slot = await ParkingSlot.findOne({ slot_number });

    if (slot) {
      if (!status_slot && slot.status_slot && slot.license_plate) {
        await addLogJob({
          plate_number: slot.license_plate,
          event: "slot_conflict_sensor_empty",
        });
        io.emit("alert_event", {
          type: "slot_conflict_sensor_empty",
          slot_number,
        });
      }

      if (status_slot && !slot.status_slot) {
        await addLogJob({ event: "slot_conflict_sensor_full" });
        io.emit("alert_event", {
          type: "slot_conflict_sensor_full",
          slot_number,
        });
      }
    }

    const updated = await ParkingSlot.findOneAndUpdate(
      { slot_number },
      { status_slot, ...(status_slot ? {} : { license_plate: null }) },
      { new: true, upsert: true }
    );

    const totalSlots = await ParkingSlot.countDocuments();
    const occupiedSlots = await ParkingSlot.countDocuments({
      status_slot: true,
    });
    const emptySlots = totalSlots - occupiedSlots;

    io.emit("slot_update", { occupiedSlots, emptySlots });

    res.json({ message: "Slot updated from sensor", updated });
  } catch (err: any) {
    logger.error(`❌ updateSlotStatusBySensor error: ${err.message}`);
    io.emit("alert_event", { type: "server_error", msg: err.message });
    res.status(500).json({ error: err.message });
  }
};

export const updateSlotByCamera = async (req: Request, res: Response) => {
  const { slot_number, license_plate } = req.body;
  const io = req.app.get("io");

  try {
    const slot = await ParkingSlot.findOne({ slot_number });

    if (slot && slot.license_plate && slot.license_plate !== license_plate) {
      await addLogJob({
        plate_number: license_plate,
        event: "slot_conflict_camera",
      });
      io.emit("alert_event", { type: "slot_conflict_camera", slot_number });
    }

    const updated = await ParkingSlot.findOneAndUpdate(
      { slot_number },
      { status_slot: true, license_plate },
      { new: true, upsert: true }
    );

    io.emit("slot_update", { slot_number, status_slot: true, license_plate });

    res.json({ message: "Slot updated from camera", updated });
  } catch (err: any) {
    logger.error(`❌ updateSlotByCamera error: ${err.message}`);
    io.emit("alert_event", { type: "server_error", msg: err.message });
    res.status(500).json({ error: err.message });
  }
};
