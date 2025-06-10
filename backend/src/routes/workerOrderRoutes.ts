import { Router, RequestHandler } from "express";
import {
  getWorkerOrders,
  getWorkerOrder,
  createWorkerOrder,
  acceptWorkerOrder,
  updateDriverLocation,
  completeWorkerOrder,
} from "../controllers/workerOrderController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect as RequestHandler, getWorkerOrders as RequestHandler);
router.get("/:id", protect as RequestHandler, getWorkerOrder as RequestHandler);
router.post(
  "/",
  protect as RequestHandler,
  createWorkerOrder as RequestHandler
);
router.patch(
  "/:id/accept",
  protect as RequestHandler,
  acceptWorkerOrder as RequestHandler
);
router.patch(
  "/:id/location",
  protect as RequestHandler,
  updateDriverLocation as RequestHandler
);
router.patch(
  "/:id/complete",
  protect as RequestHandler,
  completeWorkerOrder as RequestHandler
);

export default router;
