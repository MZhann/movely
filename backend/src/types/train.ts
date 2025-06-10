export interface TrainTicket {
  _id: string;
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: string;
  price: number;
  class: "economy" | "business" | "first";
  availableSeats: number;
  trainNumber: string;
  amenities: string[];
  status: "scheduled" | "delayed" | "cancelled";
}
