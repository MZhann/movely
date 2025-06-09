import { Router, RequestHandler } from "express";
import {
  createWorkerOrder,
  getWorkerOrders,
  getWorkerOrder,
  takeOrder,
} from "../controllers/workerOrderController";
import { protect } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  protect as RequestHandler,
  createWorkerOrder as RequestHandler
);
router.get("/", protect as RequestHandler, getWorkerOrders as RequestHandler);
router.get("/:id", protect as RequestHandler, getWorkerOrder as RequestHandler);
router.post(
  "/:id/take",
  protect as RequestHandler,
  takeOrder as RequestHandler
);

export default router;
