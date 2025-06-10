"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const workerOrderRoutes_1 = __importDefault(require("./routes/workerOrderRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const trainTicketRoutes_1 = __importDefault(require("./routes/trainTicketRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/worker_orders", workerOrderRoutes_1.default);
app.use("/api/tickets", ticketRoutes_1.default);
app.use("/api/bookings", bookingRoutes_1.default);
app.use("/api/train-tickets", trainTicketRoutes_1.default);
// Temporary test route to diagnose 404
app.get("/api/test", (req, res) => {
    res.status(200).json({ message: "Test route works!" });
});
(0, db_1.connectDB)().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
});
