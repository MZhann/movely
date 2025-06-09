import mongoose from "mongoose";

const workerOrderSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    comment: { type: String },
    destination_a: { type: String, required: true },
    destination_b: { type: String, required: true },
    destination_a_coordinates: { type: String, required: true },
    destination_b_coordinates: { type: String, required: true },
    ride_time: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "in_progress", "completed"],
      default: "active",
    },
    start_date: { type: Date },
    end_date: { type: Date },
    worker_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    placed_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const WorkerOrder = mongoose.model("WorkerOrder", workerOrderSchema);
