import mongoose from "mongoose";

const parkingLotSchema = new mongoose.Schema({
  slot_number: { type: String, required: true, unique: true },
  status_slot: { type: Boolean, default: false },
  license_plate: { type: String },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
});

const Parking = mongoose.model("Parking", parkingLotSchema);
export default Parking;
