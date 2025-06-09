import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'worker'], required: true },
  carModel: String,
  carNumber: String,
  notifyByEmail: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
