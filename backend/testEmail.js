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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from the .env file in the backend directory
dotenv_1.default.config();
const testSendEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Attempting to send a test email...");
    console.log("SMTP_USER:", process.env.SMTP_USER ? "set" : "not set");
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "set" : "not set");
    console.log("SMTP_FROM:", process.env.SMTP_FROM);
    if (!process.env.SMTP_USER ||
        !process.env.SMTP_PASS ||
        !process.env.SMTP_FROM) {
        console.error("Error: One or more SMTP environment variables are missing.");
        return;
    }
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use false for port 587 with STARTTLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Only use this in development for self-signed certs
        },
        requireTLS: true, // Explicitly require STARTTLS
    });
    try {
        yield transporter.verify();
        console.log("Transporter successfully verified. Ready to send emails.");
    }
    catch (verifyError) {
        console.error("Transporter verification failed:", verifyError);
        return;
    }
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: process.env.SMTP_USER, // Sending to yourself for testing
        subject: "Test Email from Movely Backend",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Hello from Movely Backend!</h2>
        <p>This is a test email sent from your Node.js application using Nodemailer and your Gmail SMTP settings.</p>
        <p>If you received this, your email configuration is working!</p>
        <p>Regards,<br>Your Movely Backend</p>
      </div>
    `,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log("Test email sent successfully:");
        console.log("Message ID:", info.messageId);
        console.log("Preview URL (if available):", nodemailer_1.default.getTestMessageUrl(info));
    }
    catch (error) {
        console.error("Failed to send test email:", error);
    }
});
testSendEmail();
