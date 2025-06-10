import express from "express";
import authRoutes from "./authRoutes";
import ticketRoutes from "./ticketRoutes";
import bookingRoutes from "./bookingRoutes";
import trainTicketRoutes from "./trainTicketRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/tickets", ticketRoutes);
router.use("/bookings", bookingRoutes);
router.use("/train-tickets", trainTicketRoutes);

export default router;
