"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No token provided or invalid format");
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Token verification error:", err);
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.protect = protect;
