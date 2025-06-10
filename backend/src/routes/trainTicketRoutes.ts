import express, { RequestHandler } from "express";
import { protect } from "../middleware/auth";
import TrainTicket from "../models/TrainTicket";
import Booking from "../models/Booking";
import { generateTrainTicketPDF } from "../utils/generateTrainTicketPDF";
import { bookTrainTicket } from "../controllers/trainTicketController";

const router = express.Router();

// Search train tickets
router.get("/search", async (req, res) => {
  try {
    const {
      departureCity,
      destinationCity,
      departureDate,
      minPrice,
      maxPrice,
      class: ticketClass,
    } = req.query;

    const query: any = {};

    if (departureCity) query.departureCity = departureCity;
    if (destinationCity) query.destinationCity = destinationCity;
    if (departureDate) {
      const date = new Date(departureDate as string);
      query.departureDate = {
        $gte: new Date(date.setHours(0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59)),
      };
    }
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
    if (ticketClass) query.class = ticketClass;

    const tickets = await TrainTicket.find(query);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error searching train tickets" });
  }
});

// Get hot train tickets (tickets with more than 20 available seats)
router.get("/hot", async (req, res) => {
  try {
    const tickets = await TrainTicket.find({ availableSeats: { $gt: 20 } })
      .sort({ price: 1 })
      .limit(5);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Error getting hot train tickets" });
  }
});

// Get train ticket by ID
router.get("/:id", async (req, res) => {
  try {
    const ticket = await TrainTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Train ticket not found" });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Error getting train ticket" });
  }
});

// Book train ticket
router.post("/:id/book", protect as RequestHandler, bookTrainTicket);

export default router;
