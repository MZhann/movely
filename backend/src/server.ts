import express from "express";
import dotenv from "dotenv";

dotenv.config();

import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import workerOrderRoutes from "./routes/workerOrderRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import trainTicketRoutes from "./routes/trainTicketRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/worker_orders", workerOrderRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/train-tickets", trainTicketRoutes);

// Temporary test route to diagnose 404
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Test route works!" });
});

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
});
