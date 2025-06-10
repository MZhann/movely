"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeWorkerOrder = exports.updateDriverLocation = exports.acceptWorkerOrder = exports.createWorkerOrder = exports.getWorkerOrder = exports.getWorkerOrders = void 0;
const WorkerOrder_1 = require("../models/WorkerOrder");
const User_1 = require("../models/User");
const emailService_1 = require("../services/emailService");
// Get all worker orders
const getWorkerOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield WorkerOrder_1.WorkerOrder.find()
            .populate("worker_id", "name carModel carNumber")
            .populate("placed_by_user_id", "name email");
        res.json(orders);
    }
    catch (error) {
        console.error("Error fetching worker orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getWorkerOrders = getWorkerOrders;
// Get a single worker order
const getWorkerOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield WorkerOrder_1.WorkerOrder.findById(req.params.id)
            .populate("worker_id", "name carModel carNumber")
            .populate("placed_by_user_id", "name email");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    }
    catch (error) {
        console.error("Error fetching worker order:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getWorkerOrder = getWorkerOrder;
// Create a new worker order
const createWorkerOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield WorkerOrder_1.WorkerOrder.create(req.body);
        // Find all workers and send them emails
        const workers = yield User_1.User.find({ role: "worker", notifyByEmail: true });
        if (workers.length > 0) {
            try {
                // Send email to all workers at once
                yield (0, emailService_1.sendEmail)({
                    to: workers.map((worker) => worker.email).join(", "),
                    subject: "New Order Available",
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">New Order Available</h2>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Client:</strong> ${order.name}</p>
                <p><strong>Price:</strong> ${order.price} ₸</p>
                <p><strong>From:</strong> ${order.destination_a}</p>
                <p><strong>To:</strong> ${order.destination_b}</p>
                <p><strong>Travel Time:</strong> ${order.ride_time}</p>
                ${order.comment
                        ? `<p><strong>Comment:</strong> ${order.comment}</p>`
                        : ""}
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
          `,
                });
                console.log(`Order notification sent to ${workers.length} workers`);
            }
            catch (emailError) {
                console.error("Failed to send email notifications:", emailError);
                // Continue with the response even if email fails
            }
        }
        res.status(201).json(order);
    }
    catch (error) {
        console.error("Error creating worker order:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.createWorkerOrder = createWorkerOrder;
// Accept a worker order
const acceptWorkerOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { coordinates } = req.body;
        const order = yield WorkerOrder_1.WorkerOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "active") {
            return res.status(400).json({ message: "Order is not available" });
        }
        if (order.worker_id) {
            return res.status(400).json({ message: "Order is already taken" });
        }
        const workerId = req.user.userId;
        const worker = yield User_1.User.findById(workerId);
        if (!worker || worker.role !== "worker") {
            return res
                .status(403)
                .json({ message: "Only workers can accept orders" });
        }
        // Calculate estimated arrival time based on driver's location and route
        const [driverLat, driverLng] = coordinates;
        const [startLat, startLng] = order.destination_a_coordinates
            .split(",")
            .map(Number);
        const [endLat, endLng] = order.destination_b_coordinates
            .split(",")
            .map(Number);
        // Calculate distances using Haversine formula
        const toPickupDistance = calculateDistance(driverLat, driverLng, startLat, startLng);
        const rideDistance = calculateDistance(startLat, startLng, endLat, endLng);
        // Assume average speed of 50 km/h
        const toPickupTime = (toPickupDistance / 50) * 60; // in minutes
        const rideTime = (rideDistance / 50) * 60; // in minutes
        const estimatedArrivalTime = new Date();
        estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + toPickupTime + rideTime);
        order.worker_id = workerId;
        order.status = "in_progress";
        order.start_date = new Date();
        order.driver_location = {
            type: "Point",
            coordinates: coordinates,
        };
        order.current_driver_location = {
            type: "Point",
            coordinates: coordinates,
        };
        order.estimated_arrival_time = estimatedArrivalTime;
        order.accepted_at = new Date();
        order.last_location_update = new Date();
        yield order.save();
        // Notify the user that their ride has been accepted
        const user = yield User_1.User.findById(order.placed_by_user_id);
        if (user === null || user === void 0 ? void 0 : user.notifyByEmail) {
            const trackingUrl = `${process.env.FRONTEND_URL}/ride-tracking/${order._id}`;
            yield (0, emailService_1.sendEmail)({
                to: user.email,
                subject: "Your Ride Has Been Accepted",
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Your Ride Has Been Accepted!</h2>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p>Great news! Your ride has been accepted by <strong>${worker.name}</strong>.</p>
              <p><strong>Driver Car:</strong> ${worker.carModel} (${worker.carNumber})</p>
              <p><strong>Expected Pick-up Time:</strong> ${(_a = order.estimated_arrival_time) === null || _a === void 0 ? void 0 : _a.toLocaleString()}</p>
              <p><strong>From:</strong> ${order.destination_a}</p>
              <p><strong>To:</strong> ${order.destination_b}</p>
              ${order.comment
                    ? `<p><strong>Comment:</strong> ${order.comment}</p>`
                    : ""}
            </div>
            <div style="text-align: center;">
              <a href="${trackingUrl}" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Track Your Ride
              </a>
            </div>
            <p style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              This is an automated notification. Please do not reply to this email.
            </p>
          </div>
        `,
            });
        }
        res.json(order);
    }
    catch (error) {
        console.error("Error accepting worker order:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.acceptWorkerOrder = acceptWorkerOrder;
// Update driver location
const updateDriverLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coordinates } = req.body;
        const order = yield WorkerOrder_1.WorkerOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "in_progress") {
            return res.status(400).json({ message: "Order is not in progress" });
        }
        const workerId = req.user.userId;
        if (!order.worker_id || order.worker_id.toString() !== workerId) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this order" });
        }
        // Update current location
        order.current_driver_location = {
            type: "Point",
            coordinates: coordinates,
        };
        order.last_location_update = new Date();
        // Recalculate estimated arrival time
        const [driverLat, driverLng] = coordinates;
        const [endLat, endLng] = order.destination_b_coordinates
            .split(",")
            .map(Number);
        const remainingDistance = calculateDistance(driverLat, driverLng, endLat, endLng);
        const remainingTime = (remainingDistance / 50) * 60; // in minutes
        const estimatedArrivalTime = new Date();
        estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + remainingTime);
        order.estimated_arrival_time = estimatedArrivalTime;
        yield order.save();
        res.json(order);
    }
    catch (error) {
        console.error("Error updating driver location:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateDriverLocation = updateDriverLocation;
// Complete a worker order
const completeWorkerOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield WorkerOrder_1.WorkerOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "in_progress") {
            return res.status(400).json({ message: "Order is not in progress" });
        }
        const workerId = req.user.userId;
        if (!order.worker_id || order.worker_id.toString() !== workerId) {
            return res
                .status(403)
                .json({ message: "Not authorized to complete this order" });
        }
        order.status = "completed";
        order.end_date = new Date();
        yield order.save();
        res.json(order);
    }
    catch (error) {
        console.error("Error completing worker order:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.completeWorkerOrder = completeWorkerOrder;
// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
