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
exports.generateBookingPdf = exports.getBookingsByUserId = exports.createBooking = void 0;
const Booking_1 = require("../models/Booking");
const Ticket_1 = require("../models/Ticket");
const User_1 = require("../models/User");
const pdfkit_1 = __importDefault(require("pdfkit"));
// Create a new booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Received booking request body:", req.body);
        const { ticketId, numberOfPassengers, userId } = req.body;
        const ticket = yield Ticket_1.Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        console.log("Found ticket:", ticket);
        const user = yield User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("Found user:", user);
        const totalPrice = ticket.price * numberOfPassengers;
        console.log("Calculated totalPrice:", totalPrice);
        const newBooking = yield Booking_1.Booking.create({
            ticketId,
            numberOfPassengers,
            userId,
            totalPrice,
            ticketType: "Ticket",
        });
        res.status(201).json(newBooking);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createBooking = createBooking;
// Get bookings by user ID
const getBookingsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield Booking_1.Booking.find({ userId: req.params.userId }).populate("ticketId");
        console.log("Bookings fetched from DB (with populated ticketId):", bookings);
        res.status(200).json(bookings);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getBookingsByUserId = getBookingsByUserId;
// Generate PDF for a booking
const generateBookingPdf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.params;
        console.log("Attempting to generate PDF for bookingId:", bookingId);
        const booking = yield Booking_1.Booking.findById(bookingId).populate("userId ticketId");
        console.log("Found booking for PDF generation:", booking);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const ticket = booking.ticketId; // Cast to any for easier property access
        const user = booking.userId;
        console.log("Ticket details for PDF:", ticket);
        console.log("User details for PDF:", user);
        const doc = new pdfkit_1.default({
            margin: 50,
        });
        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=booking_${bookingId}.pdf`);
        doc.pipe(res);
        doc.fontSize(25).text("Flight Booking Confirmation", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`Booking ID: ${booking._id}`);
        doc.text(`Booking Date: ${booking.bookingDate.toDateString()}`);
        doc.moveDown();
        doc.fontSize(18).text("Passenger Details", { underline: true });
        doc.text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Number of Passengers: ${booking.numberOfPassengers}`);
        doc.moveDown();
        doc.fontSize(18).text("Flight Details", { underline: true });
        doc.text(`Airline: ${ticket.airline}`);
        doc.text(`Route: ${ticket.departureCity} to ${ticket.destinationCity}`);
        doc.text(`Departure Date: ${new Date(ticket.departureDate).toDateString()}`);
        doc.text(`Departure Time: ${ticket.arrivalTime}`);
        doc.text(`Travel Time: ${ticket.travelTime}`);
        doc.moveDown();
        doc.fontSize(18).text("Fare Details", { underline: true });
        doc.text(`Price per ticket: $${ticket.price}`);
        doc.text(`Total Price: $${booking.totalPrice}`);
        doc.text(`Baggage: ${ticket.baggage}`);
        doc.text(`Carry-on: ${ticket.carryOn ? "Yes" : "No"}`);
        doc.text(`Exchangeable: ${ticket.exchangeable ? "Yes" : "No"}`);
        doc.text(`Non-refundable: ${ticket.nonRefundable ? "Yes" : "No"}`);
        doc.moveDown();
        doc
            .fontSize(12)
            .text("Thank you for booking with Movely!", { align: "center" });
        doc.end();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.generateBookingPdf = generateBookingPdf;
