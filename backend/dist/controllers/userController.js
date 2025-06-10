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
exports.getMe = exports.getUserOrders = exports.login = exports.register = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const WorkerOrder_1 = require("../models/WorkerOrder");
const getAllUsers = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.User.find().select("-password");
        return res.status(200).json(users);
    }
    catch (err) {
        console.error("Failed to fetch users:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.getAllUsers = getAllUsers;
// Register controller
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, carModel, carNumber, name, notifyByEmail } = req.body;
        const existing = yield User_1.User.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield User_1.User.create({
            email,
            password: hashedPassword,
            role,
            name,
            carModel,
            carNumber,
            notifyByEmail,
        });
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.register = register;
// Login controller
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User_1.User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // Include user ID and name in the response
        res
            .status(200)
            .json({ token, userId: user._id, name: user.name, role: user.role });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.login = login;
// Get user's orders controller
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // The user ID is available from the protect middleware
        const userId = req.user.userId;
        const orders = yield WorkerOrder_1.WorkerOrder.find({ placed_by_user_id: userId }).sort({
            createdAt: -1,
        }); // Assuming you want to sort by creation date
        res.status(200).json(orders);
    }
    catch (err) {
        console.error("Error fetching user orders:", err);
        res.status(500).json({ message: "Error fetching user orders" });
    }
});
exports.getUserOrders = getUserOrders;
// Get logged-in user details
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // The user ID is available from the protect middleware
        const userId = req.user.userId;
        const user = yield User_1.User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Error fetching user details:", err);
        res.status(500).json({ message: "Error fetching user details" });
    }
});
exports.getMe = getMe;
