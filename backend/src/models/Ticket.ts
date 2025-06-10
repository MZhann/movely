import mongoose, { Document, Schema } from "mongoose";

export interface ITicket extends Document {
  departureCity: string;
  destinationCity: string;
  price: number;
  departureDate: Date;
  arrivalTime: string;
  travelTime: string;
  airline: string;
  baggage: string;
  carryOn: boolean;
  exchangeable: boolean;
  nonRefundable: boolean;
  isHotTicket: boolean;
  returnDate?: Date;
}

const TicketSchema: Schema = new Schema({
  departureCity: { type: String, required: true },
  destinationCity: { type: String, required: true },
  price: { type: Number, required: true },
  departureDate: { type: Date, required: true },
  arrivalTime: { type: String, required: true },
  travelTime: { type: String, required: true },
  airline: { type: String, required: true },
  baggage: { type: String, required: true },
  carryOn: { type: Boolean, required: true },
  exchangeable: { type: Boolean, required: true },
  nonRefundable: { type: Boolean, required: true },
  isHotTicket: { type: Boolean, default: false },
  returnDate: { type: Date },
});

export const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
