import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No token provided or invalid format");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Decoded Token:", decoded);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
