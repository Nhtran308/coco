import mongoose from "mongoose";

const shipperSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    nationalId: { type: String, required: true, unique: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    currentOrders: { type: Number, default: 0 },
    maxOrders: { type: Number, default: 10 },
    area: { type: String },
    role: { type: String, default: "shipper" },
  },
  {
    timestamps: true,
  }
);

const shipperModel =
  mongoose.models.shipper || mongoose.model("shipper", shipperSchema);

export default shipperModel;
