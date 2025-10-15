import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    plate_number: { type: String, required: true },
    entry_time: { type: Date },
    exit_time: { type: Date, default: null },
    video_filename: { type: String }, // optional
    status: { type: Boolean, default: false }, // false=out, true=in
    price: { type: Number, default: 0 },
    rfid: { type: String },
    camera_id: { type: String },
    logs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Logs" }]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Car = mongoose.model("Car", carSchema);
export default Car;
