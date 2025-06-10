import nodemailer from "nodemailer";
import { WorkerOrder } from "../models/WorkerOrder";
import { User } from "../models/User";
import { Document } from "mongoose";

interface IWorkerOrder {
  _id: string;
  date: Date;
  name: string;
  price: number;
  comment?: string;
  destination_a: string;
  destination_b: string;
  destination_a_coordinates: string;
  destination_b_coordinates: string;
  ride_time: string;
  status: "active" | "inactive" | "in_progress" | "completed";
  start_date?: Date;
  end_date?: Date;
  worker_id?: string;
  placed_by_user_id: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create a single transporter instance for Gmail
const transporter = nodemailer.createTransport({
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

console.log("Transporter configuration (from emailService.ts):");
console.log("  User:", process.env.SMTP_USER ? "set" : "not set");
console.log("  Pass:", process.env.SMTP_PASS ? "set" : "not set");
console.log("  Full User (if set):", process.env.SMTP_USER);

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP configuration error:", error);
    console.log("SMTP_USER is: ", process.env.SMTP_USER ? "set" : "not set");
    console.log("SMTP_PASS is: ", process.env.SMTP_PASS ? "set" : "not set");
  } else {
    console.log("Gmail SMTP server is ready to take our messages");
  }
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error(
        "Attempted to send email with missing credentials. SMTP_USER: ",
        process.env.SMTP_USER ? "set" : "not set",
        ", SMTP_PASS: ",
        process.env.SMTP_PASS ? "set" : "not set"
      );
      throw new Error("Gmail SMTP credentials are not configured");
    }

    const mailOptions = {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to: options.to,
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", {
      error: error instanceof Error ? error.message : "Unknown error",
      to: options.to,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};

export const sendOrderNotification = async (order: Document & IWorkerOrder) => {
  try {
    if (!process.env.FRONTEND_URL) {
      throw new Error("Frontend URL is not configured");
    }

    // Get all workers who have email notifications enabled
    const workers = await User.find({
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
          ${
            order.comment
              ? `<p><strong>Comment:</strong> ${order.comment}</p>`
              : ""
          }
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

    await sendEmail({
      to: workers.map((worker) => worker.email).join(", "),
      subject: "New Order Available",
      html,
    });

    console.log("Order notification sent successfully:", {
      orderId: order._id,
      recipientCount: workers.length,
    });
  } catch (error) {
    console.error("Error sending order notification:", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderId: order._id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
