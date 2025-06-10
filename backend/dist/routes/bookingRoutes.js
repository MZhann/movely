"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
// import { protect } from '../middleware/authMiddleware'; // Assuming you have auth middleware
const router = (0, express_1.Router)();
router.post("/", bookingController_1.createBooking); // protect,
router.get("/user/:userId", bookingController_1.getBookingsByUserId); // protect,
router.get("/:bookingId/pdf", bookingController_1.generateBookingPdf);
exports.default = router;
