"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TicketSchema = new mongoose_1.Schema({
    departureCity: { type: String, required: true },
    destinationCity: { type: String, required: true },
    price: { type: Number, required: true },
    departureDate: { type: Date, required: true },
    arrivalTime: { type: String, required: true },
    travelTime: { type: String, required: true },
    airline: { type: String, required: true },
    baggage: { type: String, required: true },
    carryOn: { type: Boolean, required: true },
    exchangeable: { type: Boolean, required: true },
    nonRefundable: { type: Boolean, required: true },
    isHotTicket: { type: Boolean, default: false },
    returnDate: { type: Date },
});
exports.Ticket = mongoose_1.default.model("Ticket", TicketSchema);
