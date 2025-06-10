"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticketController_1 = require("../controllers/ticketController");
// import { protect, authorize } from '../middleware/authMiddleware'; // Assuming you have auth middleware
const router = (0, express_1.Router)();
router.get("/", ticketController_1.getAllTickets);
router.get("/hot", ticketController_1.getHotTickets);
router.get("/:id", ticketController_1.getTicketById);
// Admin routes
router.post("/", ticketController_1.createTicket); // protect, authorize('admin'),
router.put("/:id", ticketController_1.updateTicket); // protect, authorize('admin'),
router.delete("/:id", ticketController_1.deleteTicket); // protect, authorize('admin'),
exports.default = router;
