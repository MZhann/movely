"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const workerOrderSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    comment: { type: String },
    destination_a: { type: String, required: true },
    destination_b: { type: String, required: true },
    destination_a_coordinates: { type: String, required: true },
    destination_b_coordinates: { type: String, required: true },
    ride_time: { type: String, required: true },
    status: {
        type: String,
        enum: ["active", "inactive", "in_progress", "completed"],
        default: "active",
    },
    start_date: { type: Date },
    end_date: { type: Date },
    worker_id: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" },
    placed_by_user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    driver_location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    estimated_arrival_time: { type: Date },
    accepted_at: { type: Date },
    current_driver_location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    last_location_update: { type: Date },
}, { timestamps: true });
// Create a 2dsphere index for geospatial queries
workerOrderSchema.index({ driver_location: "2dsphere" });
workerOrderSchema.index({ current_driver_location: "2dsphere" });
exports.WorkerOrder = mongoose_1.default.model("WorkerOrder", workerOrderSchema);
