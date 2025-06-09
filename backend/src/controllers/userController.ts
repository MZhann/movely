import { Request, Response, RequestHandler } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { WorkerOrder } from "../models/WorkerOrder";

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Register controller
export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, role, carModel, carNumber, name, notifyByEmail } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      carModel,
      carNumber,
      notifyByEmail,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login controller
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Include user ID and name in the response
    res
      .status(200)
      .json({ token, userId: user._id, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's orders controller
export const getUserOrders: RequestHandler = async (req, res) => {
  try {
    // The user ID is available from the protect middleware
    const userId = (req as any).user.userId;

    const orders = await WorkerOrder.find({ placed_by_user_id: userId }).sort({
      createdAt: -1,
    }); // Assuming you want to sort by creation date

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching user orders" });
  }
};

// Get logged-in user details
export const getMe: RequestHandler = async (req, res) => {
  try {
    // The user ID is available from the protect middleware
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Error fetching user details" });
  }
};
