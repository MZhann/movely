import { Router } from "express";
import {
  createBooking,
  getBookingsByUserId,
  generateBookingPdf,
} from "../controllers/bookingController";
// import { protect } from '../middleware/authMiddleware'; // Assuming you have auth middleware

const router = Router();

router.post("/", createBooking); // protect,
router.get("/user/:userId", getBookingsByUserId); // protect,
router.get("/:bookingId/pdf", generateBookingPdf);

export default router;
