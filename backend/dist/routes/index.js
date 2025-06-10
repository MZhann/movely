"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const ticketRoutes_1 = __importDefault(require("./ticketRoutes"));
const bookingRoutes_1 = __importDefault(require("./bookingRoutes"));
const trainTicketRoutes_1 = __importDefault(require("./trainTicketRoutes"));
const router = express_1.default.Router();
router.use("/auth", authRoutes_1.default);
router.use("/tickets", ticketRoutes_1.default);
router.use("/bookings", bookingRoutes_1.default);
router.use("/train-tickets", trainTicketRoutes_1.default);
exports.default = router;
