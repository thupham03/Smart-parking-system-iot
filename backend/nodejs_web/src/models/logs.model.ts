import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
  plate_number: { type: String, required: true },
  event: { type: String, enum: ["in", "out"], required: true }, // rõ ràng hơn true/false
  timestamp: { type: Date, default: Date.now },
});

const Logs = mongoose.model("Logs", logSchema);
export default Logs;
