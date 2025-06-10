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
exports.sendOrderNotification = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const User_1 = require("../models/User");
// Create a single transporter instance for Gmail
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Only use this in development
    },
    requireTLS: true,
});
// Verify transporter configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error("SMTP configuration error:", error);
        console.log("SMTP_USER is: ", process.env.SMTP_USER ? "set" : "not set");
        console.log("SMTP_PASS is: ", process.env.SMTP_PASS ? "set" : "not set");
    }
    else {
        console.log("Gmail SMTP server is ready to take our messages");
    }
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error("Attempted to send email with missing credentials. SMTP_USER: ", process.env.SMTP_USER ? "set" : "not set", ", SMTP_PASS: ", process.env.SMTP_PASS ? "set" : "not set");
            throw new Error("Gmail SMTP credentials are not configured");
        }
        const mailOptions = {
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", {
            messageId: info.messageId,
            to: options.to,
        });
        return info;
    }
    catch (error) {
        console.error("Error sending email:", {
            error: error instanceof Error ? error.message : "Unknown error",
            to: options.to,
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
});
exports.sendEmail = sendEmail;
const sendOrderNotification = (order) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.FRONTEND_URL) {
            throw new Error("Frontend URL is not configured");
        }
        // Get all workers who have email notifications enabled
        const workers = yield User_1.User.find({
            role: "worker",
            notifyByEmail: true,
        });
        if (workers.length === 0) {
            console.log("No workers with email notifications enabled");
            return;
        }
        console.log(`Sending order notification to ${workers.length} workers`);
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">New Order</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
          <p><strong>Client:</strong> ${order.name}</p>
          <p><strong>Price:</strong> ${order.price} ₸</p>
          <p><strong>From:</strong> ${order.destination_a}</p>
          <p><strong>To:</strong> ${order.destination_b}</p>
          <p><strong>Travel Time:</strong> ${order.ride_time}</p>
          ${order.comment
            ? `<p><strong>Comment:</strong> ${order.comment}</p>`
            : ""}
          <p><strong>Coordinates:</strong></p>
          <p>Point A: ${order.destination_a_coordinates}</p>
          <p>Point B: ${order.destination_b_coordinates}</p>
        </div>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/worker/order/${order._id}" 
             style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Accept Order
          </a>
        </div>
        <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    `;
        yield (0, exports.sendEmail)({
            to: workers.map((worker) => worker.email).join(", "),
            subject: "New Order Available",
            html,
        });
        console.log("Order notification sent successfully:", {
            orderId: order._id,
            recipientCount: workers.length,
        });
    }
    catch (error) {
        console.error("Error sending order notification:", {
            error: error instanceof Error ? error.message : "Unknown error",
            orderId: order._id,
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
});
exports.sendOrderNotification = sendOrderNotification;
