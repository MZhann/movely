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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getHotTickets = exports.getAllTickets = void 0;
const Ticket_1 = require("../models/Ticket");
// Get all tickets with optional search and filters
const getAllTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departureCity, destinationCity, isOneWay, passengers } = req.query;
        let filter = {};
        if (departureCity) {
            filter.departureCity = new RegExp(departureCity, "i"); // Case-insensitive search
        }
        if (destinationCity) {
            filter.destinationCity = new RegExp(destinationCity, "i"); // Case-insensitive search
        }
        if (isOneWay !== undefined) {
            if (isOneWay === "true") {
                filter.returnDate = null;
            }
            else if (isOneWay === "false") {
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
        const tickets = yield Ticket_1.Ticket.find(filter);
        res.status(200).json(tickets);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getAllTickets = getAllTickets;
// Get hot tickets
const getHotTickets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotTickets = yield Ticket_1.Ticket.find({ isHotTicket: true });
        res.status(200).json(hotTickets);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getHotTickets = getHotTickets;
// Get a single ticket by ID
const getTicketById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield Ticket_1.Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.status(200).json(ticket);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getTicketById = getTicketById;
// Create a new ticket (Admin only)
const createTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newTicket = yield Ticket_1.Ticket.create(req.body);
        res.status(201).json(newTicket);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createTicket = createTicket;
// Update a ticket (Admin only)
const updateTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedTicket = yield Ticket_1.Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.status(200).json(updatedTicket);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateTicket = updateTicket;
// Delete a ticket (Admin only)
const deleteTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedTicket = yield Ticket_1.Ticket.findByIdAndDelete(req.params.id);
        if (!deletedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.status(200).json({ message: "Ticket deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteTicket = deleteTicket;
