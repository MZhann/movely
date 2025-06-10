import { RequestHandler } from "express";
import { Ticket } from "../models/Ticket";

// Get all tickets with optional search and filters
export const getAllTickets: RequestHandler = async (req, res) => {
  try {
    const { departureCity, destinationCity, isOneWay, passengers } = req.query;
    let filter: any = {};

    if (departureCity) {
      filter.departureCity = new RegExp(departureCity as string, "i"); // Case-insensitive search
    }
    if (destinationCity) {
      filter.destinationCity = new RegExp(destinationCity as string, "i"); // Case-insensitive search
    }

    if (isOneWay !== undefined) {
      if (isOneWay === "true") {
        filter.returnDate = null;
      } else if (isOneWay === "false") {
        filter.returnDate = { $ne: null };
      }
    }

    // Assuming 'passengers' is a number and can be used for filtering if a corresponding field exists in the Ticket model
    // For now, it's just included in the filter object. You might need to add a 'capacity' or 'availableSeats' field to your Ticket model.
    if (passengers) {
      // This filter is currently a placeholder as there's no direct 'passengers' or 'availableSeats' field in the Ticket model.
      // If you intend to filter by capacity, please add a 'capacity' field to your Ticket model.
      // filter.capacity = { $gte: parseInt(passengers as string) };
      // For now, it will be ignored.
    }

    const tickets = await Ticket.find(filter);
    res.status(200).json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get hot tickets
export const getHotTickets: RequestHandler = async (req, res) => {
  try {
    const hotTickets = await Ticket.find({ isHotTicket: true });
    res.status(200).json(hotTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single ticket by ID
export const getTicketById: RequestHandler = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new ticket (Admin only)
export const createTicket: RequestHandler = async (req, res) => {
  try {
    const newTicket = await Ticket.create(req.body);
    res.status(201).json(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a ticket (Admin only)
export const updateTicket: RequestHandler = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a ticket (Admin only)
export const deleteTicket: RequestHandler = async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
