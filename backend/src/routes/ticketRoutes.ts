import { Router } from "express";
import {
  getAllTickets,
  getHotTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
// import { protect, authorize } from '../middleware/authMiddleware'; // Assuming you have auth middleware

const router = Router();

router.get("/", getAllTickets);
router.get("/hot", getHotTickets);
router.get("/:id", getTicketById);
// Admin routes
router.post("/", createTicket); // protect, authorize('admin'),
router.put("/:id", updateTicket); // protect, authorize('admin'),
router.delete("/:id", deleteTicket); // protect, authorize('admin'),

export default router;
