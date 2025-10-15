import { Request, Response } from "express";
import Car from "../models/car.model";
import moment from "moment-timezone";

export const getChartData = async (req: Request, res: Response) => {
  try {
    const startOfWeek = moment().tz("Asia/Ho_Chi_Minh").startOf("isoWeek");
    const endOfWeek = moment().tz("Asia/Ho_Chi_Minh").endOf("isoWeek");

    const [entries, exits] = await Promise.all([
      Car.aggregate([
        {
          $match: {
            entry_time: {
              $gte: startOfWeek.toDate(),
              $lte: endOfWeek.toDate(),
            },
          },
        },
        {
          $group: {
            _id: { $isoDayOfWeek: "$entry_time" }, // 👈 dùng ISO để khớp thứ 2 → CN
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Car.aggregate([
        {
          $match: {
            exit_time: {
              $gte: startOfWeek.toDate(),
              $lte: endOfWeek.toDate(),
            },
          },
        },
        {
          $group: {
            _id: { $isoDayOfWeek: "$exit_time" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const formatData = (data: any[]) => {
      const result = Array(7).fill(0);
      data.forEach((item) => {
        result[item._id - 1] = item.count;
      });
      return result;
    };

    res.json({
      entries: formatData(entries),
      exits: formatData(exits),
    });
  } catch (err: any) {
    console.error("❌ getChartData error:", err);
    res.status(500).json({ error: err.message });
  }
};
