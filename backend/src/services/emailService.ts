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

// Create a transporter using SMTP for Mail.ru
const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP configuration error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

export const sendOrderNotification = async (order: Document & IWorkerOrder) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email configuration is missing");
    }

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

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: workers.map((worker) => worker.email).join(", "),
      subject: "Новый заказ",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Новый заказ</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p><strong>Дата:</strong> ${new Date(
              order.date
            ).toLocaleString()}</p>
            <p><strong>Клиент:</strong> ${order.name}</p>
            <p><strong>Цена:</strong> ${order.price} ₸</p>
            <p><strong>Откуда:</strong> ${order.destination_a}</p>
            <p><strong>Куда:</strong> ${order.destination_b}</p>
            <p><strong>Время в пути:</strong> ${order.ride_time}</p>
            ${
              order.comment
                ? `<p><strong>Комментарий:</strong> ${order.comment}</p>`
                : ""
            }
            <p><strong>Координаты:</strong></p>
            <p>Точка A: ${order.destination_a_coordinates}</p>
            <p>Точка B: ${order.destination_b_coordinates}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/worker/order/${order._id}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Взять заказ
            </a>
          </div>
          <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Order notification email sent successfully:", {
      messageId: info.messageId,
      orderId: order._id,
      recipientCount: workers.length,
    });
  } catch (error) {
    console.error("Error sending order notification email:", {
      error: error instanceof Error ? error.message : "Unknown error",
      orderId: order._id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
