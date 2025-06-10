"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookTrainTicket = exports.deleteTrainTicket = exports.updateTrainTicket = exports.createTrainTicket = exports.searchTrainTickets = exports.getTrainTicketById = exports.getAllTrainTickets = void 0;
const TrainTicket_1 = __importDefault(require("../models/TrainTicket"));
const Booking_1 = require("../models/Booking");
const generateTrainTicketPDF_1 = require("../utils/generateTrainTicketPDF");
const User_1 = require("../models/User");
// Get all train tickets
const getAllTrainTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield TrainTicket_1.default.find();
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching train tickets", error });
    }
});
exports.getAllTrainTickets = getAllTrainTickets;
// Get train ticket by ID
const getTrainTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield TrainTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Train ticket not found" });
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching train ticket", error });
    }
});
exports.getTrainTicketById = getTrainTicketById;
// Search train tickets
const searchTrainTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departureCity, destinationCity, departureDate, returnDate, minPrice, maxPrice, class: trainClass, } = req.query;
        const query = {};
        if (departureCity) {
            query.departureCity = new RegExp(departureCity, "i");
        }
        if (destinationCity) {
            query.destinationCity = new RegExp(destinationCity, "i");
        }
        if (departureDate) {
            query.departureDate = {
                $gte: new Date(departureDate),
            };
        }
        if (returnDate) {
            query.returnDate = {
                $lte: new Date(returnDate),
            };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        if (trainClass) {
            query.class = trainClass;
        }
        const tickets = yield TrainTicket_1.default.find(query);
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error searching train tickets", error });
    }
});
exports.searchTrainTickets = searchTrainTickets;
// Create new train ticket
const createTrainTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = new TrainTicket_1.default(req.body);
        yield ticket.save();
        res.status(201).json(ticket);
    }
    catch (error) {
        res.status(400).json({ message: "Error creating train ticket", error });
    }
});
exports.createTrainTicket = createTrainTicket;
// Update train ticket
const updateTrainTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield TrainTicket_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!ticket) {
            return res.status(404).json({ message: "Train ticket not found" });
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating train ticket", error });
    }
});
exports.updateTrainTicket = updateTrainTicket;
// Delete train ticket
const deleteTrainTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield TrainTicket_1.default.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Train ticket not found" });
        }
        res.json({ message: "Train ticket deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting train ticket", error });
    }
});
exports.deleteTrainTicket = deleteTrainTicket;
// Book train ticket
const bookTrainTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield TrainTicket_1.default.findById(req.params.id);
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
        const user = yield User_1.User.findById(userIdFromToken); // Fetch full user object
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const booking = new Booking_1.Booking({
            userId: user._id,
            ticketId: ticket._id,
            ticketType: "TrainTicket",
            numberOfPassengers: 1,
            totalPrice: ticket.price,
            status: "confirmed",
        });
        // Update available seats
        ticket.availableSeats -= 1;
        yield ticket.save();
        yield booking.save();
        // Generate PDF ticket
        const pdfBuffer = yield (0, generateTrainTicketPDF_1.generateTrainTicketPDF)(ticket, user);
        res.json({
            message: "Train ticket booked successfully",
            booking,
            pdfBuffer: pdfBuffer.toString("base64"),
        });
    }
    catch (error) {
        console.error("Error in bookTrainTicket:", error);
        res.status(500).json({ message: "Error booking train ticket" });
    }
});
exports.bookTrainTicket = bookTrainTicket;
