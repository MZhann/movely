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
exports.generateTrainTicketPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateTrainTicketPDF = (ticket, user) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: "A4",
                margin: 50,
            });
            const chunks = [];
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            // Header
            doc.fontSize(20).text("Train Ticket", { align: "center" }).moveDown();
            // Train Information
            doc
                .fontSize(14)
                .text(`Train Number: ${ticket.trainNumber}`)
                .text(`Class: ${ticket.class}`)
                .moveDown();
            // Journey Details
            doc
                .fontSize(16)
                .text("Journey Details", { underline: true })
                .moveDown()
                .fontSize(12)
                .text(`From: ${ticket.departureCity}`)
                .text(`To: ${ticket.destinationCity}`)
                .text(`Date: ${new Date(ticket.departureDate).toLocaleDateString()}`)
                .text(`Departure Time: ${ticket.departureTime}`)
                .text(`Arrival Time: ${ticket.arrivalTime}`)
                .moveDown();
            // Passenger Information
            doc
                .fontSize(16)
                .text("Passenger Information", { underline: true })
                .moveDown()
                .fontSize(12)
                .text(`Name: ${user.name}`)
                .text(`Email: ${user.email}`)
                .moveDown();
            // Price
            doc
                .fontSize(16)
                .text(`Price: $${ticket.price}`, { align: "right" })
                .moveDown();
            // Amenities
            doc
                .fontSize(14)
                .text("Amenities:", { underline: true })
                .moveDown()
                .fontSize(12);
            ticket.amenities.forEach((amenity) => {
                doc.text(`• ${amenity}`);
            });
            // Footer
            doc
                .moveDown(2)
                .fontSize(10)
                .text("Thank you for choosing our train service!", { align: "center" })
                .text("Please keep this ticket with you during your journey.", {
                align: "center",
            });
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
});
exports.generateTrainTicketPDF = generateTrainTicketPDF;
