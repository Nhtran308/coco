import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: {
      type: String,
      enum: ["user", "admin", "shipper"],
      default: "user",
    },
    address: {
      phone: { type: String, default: "" },
      houseNumber: { type: String, default: "" },
      ward: { type: String, default: "" },
      district: { type: String, default: "" },
      province: { type: String, default: "" },
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isSubscribed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
