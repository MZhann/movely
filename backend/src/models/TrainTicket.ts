import mongoose, { Schema, Document } from "mongoose";

export interface ITrainTicket extends Document {
  trainNumber: string;
  departureCity: string;
  destinationCity: string;
  departureDate: Date;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  class: "economy" | "business" | "first";
  amenities: string[];
  status: "scheduled" | "delayed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const TrainTicketSchema: Schema = new Schema(
  {
    trainNumber: {
      type: String,
      required: true,
      unique: true,
    },
    departureCity: {
      type: String,
      required: true,
    },
    destinationCity: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    class: {
      type: String,
      enum: ["economy", "business", "first"],
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["scheduled", "delayed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITrainTicket>("TrainTicket", TrainTicketSchema);
