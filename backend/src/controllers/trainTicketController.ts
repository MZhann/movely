import { Request, Response } from "express";
import TrainTicket from "../models/TrainTicket";
import { Booking } from "../models/Booking";
import { generateTrainTicketPDF } from "../utils/generateTrainTicketPDF";
import { User } from "../models/User";

// Define a custom Request interface to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Get all train tickets
export const getAllTrainTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await TrainTicket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching train tickets", error });
  }
};

// Get train ticket by ID
export const getTrainTicketById = async (req: Request, res: Response) => {
  try {
    const ticket = await TrainTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Train ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error fetching train ticket", error });
  }
};

// Search train tickets
export const searchTrainTickets = async (req: Request, res: Response) => {
  try {
    const {
      departureCity,
      destinationCity,
      departureDate,
      returnDate,
      minPrice,
      maxPrice,
      class: trainClass,
    } = req.query;

    const query: any = {};

    if (departureCity) {
      query.departureCity = new RegExp(departureCity as string, "i");
    }
    if (destinationCity) {
      query.destinationCity = new RegExp(destinationCity as string, "i");
    }
    if (departureDate) {
      query.departureDate = {
        $gte: new Date(departureDate as string),
      };
    }
    if (returnDate) {
      query.returnDate = {
        $lte: new Date(returnDate as string),
      };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (trainClass) {
      query.class = trainClass;
    }

    const tickets = await TrainTicket.find(query);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error searching train tickets", error });
  }
};

// Create new train ticket
export const createTrainTicket = async (req: Request, res: Response) => {
  try {
    const ticket = new TrainTicket(req.body);
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Error creating train ticket", error });
  }
};

// Update train ticket
export const updateTrainTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await TrainTicket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Train ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(400).json({ message: "Error updating train ticket", error });
  }
};

// Delete train ticket
export const deleteTrainTicket = async (req: Request, res: Response) => {
  try {
    const ticket = await TrainTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Train ticket not found" });
    }
    res.json({ message: "Train ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting train ticket", error });
  }
};

// Book train ticket
export const bookTrainTicket = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const ticket = await TrainTicket.findById(req.params.id);
    console.log("Train Ticket retrieved for booking:", ticket);
    if (!ticket) {
      return res.status(404).json({ message: "Train ticket not found" });
    }

    if (ticket.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    // Create booking
    // Ensure req.user is not undefined before accessing userId
    if (!req.user || !req.user.userId) {
      console.error("Error: userId not found in request user object.");
      return res
        .status(401)
        .json({ message: "User not authenticated or userId missing" });
    }

    console.log("User ID for booking:", req.user.userId);
    const userIdFromToken = req.user.userId;
    const user = await User.findById(userIdFromToken); // Fetch full user object
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const booking = new Booking({
      userId: user._id,
      ticketId: ticket._id,
      ticketType: "TrainTicket",
      numberOfPassengers: 1,
      totalPrice: ticket.price,
      status: "confirmed",
    });

    // Update available seats
    ticket.availableSeats -= 1;
    await ticket.save();
    await booking.save();

    // Generate PDF ticket
    const pdfBuffer = await generateTrainTicketPDF(ticket, user);

    res.json({
      message: "Train ticket booked successfully",
      booking,
      pdfBuffer: pdfBuffer.toString("base64"),
    });
  } catch (error) {
    console.error("Error in bookTrainTicket:", error);
    res.status(500).json({ message: "Error booking train ticket" });
  }
};
