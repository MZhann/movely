import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  ticketId: mongoose.Schema.Types.ObjectId;
  ticketType: "Ticket" | "TrainTicket";
  numberOfPassengers: number;
  bookingDate: Date;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
}

const BookingSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "ticketType",
    required: true,
  },
  ticketType: {
    type: String,
    enum: ["Ticket", "TrainTicket"],
    required: true,
  },
  numberOfPassengers: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "pending", "cancelled"],
    default: "confirmed",
  },
});

export const Booking = mongoose.model<IBooking>("Booking", BookingSchema);
