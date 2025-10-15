import { Request, Response } from "express";
import Parking from "../models/parkingSlot.model";
import Car from "../models/car.model";
import moment from "moment-timezone";
import User from "../models/user.model";
import Logs from "../models/logs.model";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const formatDate = (
  date: Date | null | undefined,
  format: string,
  timezone: string
): string => {
  if (!date) return "N/A";
  return moment(date).tz(timezone).format(format);
};

const formatLogs = (logs: any[]) => {
  return logs.map((log) => ({
    plate_number: log.plate_number,
    timestamp: formatDate(
      log.timestamp,
      "YYYY-MM-DD HH:mm:ss",
      "Asia/Ho_Chi_Minh"
    ),
    status: log.status ? "Đang đỗ" : "Đã rời đi",
  }));
};

export const viewHome = async (req: Request, res: Response) => {
  const carCondition = {
    plate_number: { $exists: true, $ne: null },
    entry_time: { $exists: true },
    status: true,
    rfid: { $exists: true, $ne: null },
  };
  const currentCars = await Car.find(carCondition);

  const totalSlots = await Parking.countDocuments();

  const occupiedSlots = await Parking.countDocuments({
    status_slot: true,
  });

  const emptySlotCount = Math.max(totalSlots - occupiedSlots, 0);

  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  const accessCount = await Car.countDocuments({
    entry_time: { $gte: startOfDay, $lte: endOfDay },
  });

  const exitCount = await Car.countDocuments({
    exit_time: { $gte: startOfDay, $lte: endOfDay },
  });

  const data = {
    car: occupiedSlots,
    emptySlotCount,
    accessCount,
    exitCount,
    currentCars,
  };

  res.render("pages/home", data);
};

export const viewCar = async (req: Request, res: Response) => {
  const carList = await Car.find().sort({ entry_time: -1 });

  const formattedCars = carList.map((car) => {
    const isInParking = car.status === true;
    return {
      plate_number: car.plate_number || "Không xác định",
      entry_time: car.entry_time
        ? moment(car.entry_time)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")
        : "—",
      exit_time: car.exit_time
        ? moment(car.exit_time)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss")
        : "Đang đỗ",
      price: car.price > 0 ? `${car.price.toLocaleString("vi-VN")} ₫` : "—",
      status: isInParking
        ? '<span class="status in">Đang đỗ</span>'
        : '<span class="status out">Đã rời bãi</span>',
    };
  });

  res.render("pages/car-management", { carList: formattedCars });
};
export const viewParking = async (req: Request, res: Response) => {
  try {
    const parkingSlots = await Parking.find().sort({ slot_number: 1 });

    const parkingData = parkingSlots.reduce((acc: any, slot) => {
      const isOccupied = slot.status_slot === true;
      acc[slot.slot_number] = {
        status_slot: isOccupied,
        license_plate: slot.license_plate || "",
      };
      return acc;
    }, {});

    res.render("pages/parking-management", { data: parkingData });
  } catch (err: any) {
    console.error("❌ viewParking error:", err.message);
    res.status(500).send("Internal Server Error");
  }
};

export const viewUsers = async (req: Request, res: Response) => {
  const users = await User.find();
  const formattedUsers = users.map((user) => ({
    ...user.toObject(),
    role: user.role === "admin" ? "Người quản trị" : "Nhân viên",
  }));
  res.render("pages/user-managerment", { users: formattedUsers });
};

export const viewAnalytics = async (req: Request, res: Response) => {
  const period = req.query.period || "daily";
  let startDate, previousStartDate, previousEndDate;

  switch (period) {
    case "weekly":
      startDate = moment().subtract(1, "weeks").startOf("week").toDate();
      previousStartDate = moment()
        .subtract(2, "weeks")
        .startOf("week")
        .toDate();
      previousEndDate = moment().subtract(1, "weeks").startOf("week").toDate();
      break;
    case "monthly":
      startDate = moment().subtract(1, "months").startOf("month").toDate();
      previousStartDate = moment()
        .subtract(2, "months")
        .startOf("month")
        .toDate();
      previousEndDate = moment()
        .subtract(1, "months")
        .startOf("month")
        .toDate();
      break;
    case "daily":
    default:
      startDate = moment().startOf("day").toDate();
      previousStartDate = moment().subtract(1, "days").startOf("day").toDate();
      previousEndDate = moment().startOf("day").toDate();
      break;
  }

  const totalCars = await Car.countDocuments({
    entry_time: { $gte: startDate },
  });
  const availableSpots = await Car.countDocuments({ status: false });
  const carEntries = await Car.countDocuments({
    entry_time: { $gte: startDate },
  });
  const carExits = await Car.countDocuments({
    exit_time: { $gte: startDate },
  });

  const previousTotalCars = await Car.countDocuments({
    entry_time: { $gte: previousStartDate, $lt: previousEndDate },
  });
  const previousCarEntries = await Car.countDocuments({
    entry_time: { $gte: previousStartDate, $lt: previousEndDate },
  });
  const previousCarExits = await Car.countDocuments({
    exit_time: { $gte: previousStartDate, $lt: previousEndDate },
  });

  const totalCarsChange = previousTotalCars
    ? (((totalCars - previousTotalCars) / previousTotalCars) * 100).toFixed(2) +
      "%"
    : "0%";
  const carEntriesChange = previousCarEntries
    ? (((carEntries - previousCarEntries) / previousCarEntries) * 100).toFixed(
        2
      ) + "%"
    : "0%";
  const carExitsChange = previousCarExits
    ? (((carExits - previousCarExits) / previousCarExits) * 100).toFixed(2) +
      "%"
    : "0%";

  const data = {
    totalCarsChange,
    totalCars,
    availableSpots,
    carEntries,
    carExits,
    carEntriesChange,
    carExitsChange,
  };

  res.render("pages/analytics", data);
};
export const viewLogs = async (req: Request, res: Response) => {
  const logs = await Logs.find().sort({ timestamp: -1 }); // ✅ mới nhất lên đầu
  const formattedLogs = logs.map((log) => ({
    plate_number: log.plate_number,
    timestamp: log.timestamp,
    event:
      log.event === "in"
        ? "Xe vào"
        : log.event === "out"
        ? "Xe ra"
        : "Không xác định",
  }));

  res.render("pages/logs", { logs: formattedLogs });
};

export const getLogs = async (req: Request, res: Response) => {
  const logs = await Logs.find().sort({ timestamp: -1 }); // ✅ mới nhất lên đầu
  const formattedLogs = logs.map((log) => ({
    plate_number: log.plate_number,
    timestamp: log.timestamp,
    event:
      log.event === "in"
        ? "Xe vào"
        : log.event === "out"
        ? "Xe ra"
        : "Không xác định",
  }));

  res.json({ logs: formattedLogs });
};
