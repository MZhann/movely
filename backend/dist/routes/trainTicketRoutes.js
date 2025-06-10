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
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const TrainTicket_1 = __importDefault(require("../models/TrainTicket"));
const trainTicketController_1 = require("../controllers/trainTicketController");
const router = express_1.default.Router();
// Search train tickets
router.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { departureCity, destinationCity, departureDate, minPrice, maxPrice, class: ticketClass, } = req.query;
        const query = {};
        if (departureCity)
            query.departureCity = departureCity;
        if (destinationCity)
            query.destinationCity = destinationCity;
        if (departureDate) {
            const date = new Date(departureDate);
            query.departureDate = {
                $gte: new Date(date.setHours(0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59)),
            };
        }
        if (minPrice)
            query.price = { $gte: Number(minPrice) };
        if (maxPrice)
            query.price = Object.assign(Object.assign({}, query.price), { $lte: Number(maxPrice) });
        if (ticketClass)
            query.class = ticketClass;
        const tickets = yield TrainTicket_1.default.find(query);
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error searching train tickets" });
    }
}));
// Get hot train tickets (tickets with more than 20 available seats)
router.get("/hot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tickets = yield TrainTicket_1.default.find({ availableSeats: { $gt: 20 } })
            .sort({ price: 1 })
            .limit(5);
        res.json(tickets);
    }
    catch (error) {
        res.status(500).json({ message: "Error getting hot train tickets" });
    }
}));
// Get train ticket by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ticket = yield TrainTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Train ticket not found" });
        }
        res.json(ticket);
    }
    catch (error) {
        res.status(500).json({ message: "Error getting train ticket" });
    }
}));
// Book train ticket
router.post("/:id/book", auth_1.protect, trainTicketController_1.bookTrainTicket);
exports.default = router;
