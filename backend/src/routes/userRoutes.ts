import { Router } from "express";
import { getUserOrders, getMe } from "../controllers/userController";
import { protect } from "../middleware/auth";
import { RequestHandler } from "express";

const router = Router();

router.get("/me", protect as RequestHandler, getMe as RequestHandler);
router.get(
  "/orders",
  protect as RequestHandler,
  getUserOrders as RequestHandler
);

export default router;
