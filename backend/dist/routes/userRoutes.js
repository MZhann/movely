"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/me", auth_1.protect, userController_1.getMe);
router.get("/orders", auth_1.protect, userController_1.getUserOrders);
exports.default = router;
