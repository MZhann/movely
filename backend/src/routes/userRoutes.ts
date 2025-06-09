import { Router } from "express";
import {
  register,
  login,
  getUserOrders,
  getMe,
} from "../controllers/userController";
import { protect } from "../middleware/auth";
import { RequestHandler } from "express";

const router = Router();

router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);
router.get(
  "/orders",
  protect as RequestHandler,
  getUserOrders as RequestHandler
);
router.get("/me", protect as RequestHandler, getMe as RequestHandler);

export default router;
