import PDFDocument from "pdfkit";
import { IUser } from "../models/User";
import { ITrainTicket } from "../models/TrainTicket";

export const generateTrainTicketPDF = async (
  ticket: ITrainTicket,
  user: IUser
) => {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const chunks: Buffer[] = [];
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
    } catch (error) {
      reject(error);
    }
  });
};
