import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "Đã đặt hàng",
        "Đã hoàn hàng",
        "Đang xử lý",
        "Hủy đơn thành công",
        "Hủy đơn không thành công",
        "Đang giao hàng",
        "Đã giao thành công",
        "Giao không thành công",
        "Yêu cầu hủy đơn",
        "Yêu cầu hoàn hàng",
      ],
      default: "Đã đặt hàng",
    },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    date: { type: Date, required: true },
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipper",
      default: null,
    },

    cancelReason: { type: String, default: null },
    cancelRequestedAt: { type: Date, default: null },
    returned: { type: Boolean, default: false },
    voucherCode: { type: String, default: null },
  },
  { timestamps: true }
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
