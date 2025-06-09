import { Request, Response } from "express";
import { WorkerOrder } from "../models/WorkerOrder";
import { sendOrderNotification } from "../services/emailService";

export const createWorkerOrder = async (req: Request, res: Response) => {
  try {
    const order = await WorkerOrder.create(req.body);

    // Send email notification to workers
    try {
      await sendOrderNotification(order);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Continue with the response even if email fails
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Ошибка при создании заказа" });
  }
};

export const getWorkerOrders = async (req: Request, res: Response) => {
  try {
    const orders = await WorkerOrder.find().sort({ date: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Ошибка при получении заказов" });
  }
};

export const getWorkerOrder = async (req: Request, res: Response) => {
  try {
    const order = await WorkerOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }
    res.status(200).json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Ошибка при получении заказа" });
  }
};

export const takeOrder = async (req: Request, res: Response) => {
  try {
    const { status, start_date } = req.body;
    const order = await WorkerOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Заказ не найден" });
    }

    if (order.status !== "active") {
      return res.status(400).json({ message: "Заказ уже взят или завершен" });
    }

    order.status = status;
    order.start_date = start_date;
    order.worker_id = (req as any).user.userId; // Assuming you have auth middleware
    await order.save();

    res.status(200).json(order);
  } catch (err) {
    console.error("Error taking order:", err);
    res.status(500).json({ message: "Ошибка при взятии заказа" });
  }
};
