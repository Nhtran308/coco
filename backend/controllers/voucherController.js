import voucherModel from "../models/voucherModel.js";

// Tạo voucher
const createVoucher = async (req, res) => {
  const { code, discount, expiryDate, usageLimit } = req.body;
  try {
    const existing = await voucherModel.findOne({ code });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Mã giảm giá đã tồn tại." });
    }

    const voucherData = {
      code,
      discount,
      expiryDate,
      usageLimit,
      usageCount: 0,
      usedBy: [],
    };
    const voucher = new voucherModel(voucherData);
    await voucher.save();

    return res
      .status(201)
      .json({ success: true, message: "Tạo mã giảm giá thành công!" });
  } catch (error) {
    console.error("Error in createVoucher:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Lỗi server" });
  }
};

// Sử dụng voucher
const applyVoucher = async (req, res) => {
  const { code, cartTotal, userId } = req.body;

  try {
    const voucher = await voucherModel.findOne({ code });

    if (!voucher) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá không hợp lệ!",
      });
    }

    const currentDate = new Date();
    if (new Date(voucher.expiryDate) < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá đã hết hạn!",
      });
    }

    // ✅ Kiểm tra xem user đã dùng chưa
    if (voucher.usedBy.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã sử dụng mã này rồi!",
      });
    }

    const discountAmount = (cartTotal * voucher.discount) / 100;
    const totalAfterDiscount = cartTotal - discountAmount;

    return res.status(200).json({
      success: true,
      discountAmount,
      totalAfterDiscount,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng mã:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Đánh dấu đã sử dụng
const usedVoucher = async (voucher) => {
  try {
    voucher.used = true;
    await voucher.save();
  } catch (error) {
    console.error("Error marking voucher as used:", error);
    throw new Error("Không thể đánh dấu mã giảm giá đã sử dụng.");
  }
};

// Lấy thông tin voucher theo mã
const getVoucher = async (req, res) => {
  const { code } = req.params;

  try {
    const voucher = await voucherModel.findOne({ code });

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Mã giảm giá không tồn tại!" });
    }

    return res.status(200).json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error("Error in getVoucher:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Lỗi server" });
  }
};

export { createVoucher, applyVoucher, usedVoucher, getVoucher };
