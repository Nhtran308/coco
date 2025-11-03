import orderModel from "../models/orderModel.js";
import shipperModel from "../models/shipperModel.js";
import productModel from "../models/productModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

//Tạo tài khoản shipper
const createShipper = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      nationalId,
      vehicleNumber,
      licenseNumber,
      area,
    } = req.body;

    if (
      !name ||
      !phone ||
      !email ||
      !password ||
      !nationalId ||
      !vehicleNumber ||
      !licenseNumber ||
      !area
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin nhân viên",
      });
    }

    const exists = await shipperModel.findOne({ $or: [{ email }, { phone }] });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Nhân viên đang hoạt động",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email hợp lệ",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng đặt mật khẩu mạnh hơn",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newShipper = new shipperModel({
      name,
      phone,
      email,
      password: hashedPassword,
      nationalId,
      vehicleNumber,
      licenseNumber,
      area,
    });

    const shipper = await newShipper.save();
    const token = createToken(shipper._id, shipper.role);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log("createShipper: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Đăng nhập tài khoản shipper
const loginShipper = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const shipper = await shipperModel.findOne({ email });
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    const isMatch = await bcrypt.compare(password, shipper.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu không đúng",
      });
    }

    const token = createToken(shipper._id, shipper.role);
    res.json({ success: true, token, role: shipper.role });
  } catch (error) {
    console.log("loginShipper: ", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

//Lấy danh sách shipper
const getAllShipper = async (req, res) => {
  try {
    const shippers = await shipperModel.find();
    res.status(200).json({
      success: true,
      data: shippers,
    });
  } catch (error) {
    console.log("getAllShipper: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Lấy thông tin shipper
const getShipperById = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const shipper = await shipperModel.findById(shipperId);

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shipper",
      });
    }

    res.status(200).json({
      success: true,
      data: shipper,
    });
  } catch (error) {
    console.log("getShipperById: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Cập nhật trạng thái đơn hàng
const updateStatus = async (req, res) => {
  try {
    const { orderId, status, cancelReason } = req.body;

    const validStatuses = [
      "Đã đặt hàng",
      "Đang giao hàng",
      "Đã giao thành công",
      "Giao không thành công",
    ];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Trạng thái không hợp lệ!" });
    }

    const existingOrder = await orderModel.findById(orderId);
    if (!existingOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng!" });
    }

    const updateData = { status };

    if (status === "Giao không thành công") {
      updateData.cancelReason = cancelReason || "Shipper không giao được hàng";

      for (const item of existingOrder.items) {
        const productId = item._id;
        const returnQty = item.quantity || 1;

        const product = await productModel.findById(productId);
        if (product) {
          const currentStock = Number(product.totalStock) || 0;
          await productModel.findByIdAndUpdate(productId, {
            totalStock: currentStock + returnQty,
          });
        } else {
          console.log("Không tìm thấy sản phẩm với ID:", productId);
        }
      }
    }

    if (status === "Đã giao thành công") {
      updateData.payment = true;
      updateData.cancelReason = "";

      if (existingOrder.status !== "Đã giao thành công") {
        for (const item of existingOrder.items) {
          const productId = item._id;
          const addQty = item.quantity || 1;

          const product = await productModel.findById(productId);
          if (product) {
            const currentTotal = Number(product.totalSold) || 0;
            await productModel.findByIdAndUpdate(productId, {
              totalSold: currentTotal + addQty,
            });
          } else {
            console.log("Không tìm thấy sản phẩm với ID:", productId);
          }
        }
      }
    }

    if (cancelReason && status !== "Giao không thành công") {
      updateData.cancelReason = cancelReason;
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Đã cập nhật trạng thái đơn hàng!",
      data: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Cập nhật hồ sơ
const updateShipper = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const { name, phone, email, nationalId, licenseNumber, vehicleNumber } =
      req.body;

    const updateData = {
      name,
      phone,
      email,
      nationalId,
      licenseNumber,
      vehicleNumber,
    };

    const updatedShipper = await shipperModel.findByIdAndUpdate(
      shipperId,
      updateData,
      { new: true }
    );

    if (!updatedShipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shipper.",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công.",
      shipper: updatedShipper,
    });
  } catch (error) {
    console.log("updateShipper: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const shipperId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.",
      });
    }

    const shipper = await shipperModel.findById(shipperId);
    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shipper.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, shipper.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    shipper.password = hashedPassword;

    await shipper.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    console.log("changePassword:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ: " + error.message,
    });
  }
};

//Xóa shipper
const deleteShipper = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await shipperModel.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Shipper không tồn tại!" });
    }

    res.status(200).json({ success: true, message: "Xóa shipper thành công!" });
  } catch (error) {
    console.log("deleteShipper", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Lấy danh sách đơn hàng đã giao
const getShipperOrders = async (req, res) => {
  try {
    const shipperId = req.user.id;
    if (!shipperId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin shipper trong token.",
      });
    }

    const deliveredStatuses = ["Đã giao thành công", "Giao không thành công"];

    const orders = await orderModel
      .find({
        shipperId,
        status: { $in: deliveredStatuses },
      })
      .sort({ updatedAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log("getShipperOrders: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Lấy báo cáo
const getShipperReport = async (req, res) => {
  try {
    const shipperId = req.user.id;

    const orders = await orderModel.find({ shipperId: shipperId });

    const successOrders = orders.filter(
      (o) => o.status === "Đã giao thành công"
    );
    const failedOrders = orders.filter(
      (o) => o.status === "Giao không thành công"
    );

    const revenue = successOrders.reduce((sum, o) => sum + o.amount, 0);

    const salary = successOrders.length * 35000 + failedOrders.length * 10000;

    const salaryMap = {};
    successOrders.forEach((o) => {
      const d = new Date(o.date);
      const key = `${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
      salaryMap[key] = (salaryMap[key] || 0) + 35000;
    });
    failedOrders.forEach((o) => {
      const d = new Date(o.date);
      const key = `${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()}`;
      salaryMap[key] = (salaryMap[key] || 0) + 10000;
    });
    const salaryByMonth = Object.entries(salaryMap).map(
      ([month, totalSalary]) => ({
        month,
        totalSalary,
      })
    );

    const cancelReasonStats = {};
    failedOrders.forEach((o) => {
      const reason = o.cancelReason || "Không rõ";
      cancelReasonStats[reason] = (cancelReasonStats[reason] || 0) + 1;
    });

    const cancelReasons = Object.entries(cancelReasonStats).map(
      ([reason, count]) => ({
        _id: reason,
        count,
      })
    );

    // Thống kê số đơn theo quận
    const districtMap = {};
    successOrders.forEach((o) => {
      const district = o.address?.district || "Không rõ";
      districtMap[district] = (districtMap[district] || 0) + 1;
    });

    const districtStats = Object.entries(districtMap).map(
      ([district, count]) => ({
        district,
        count,
      })
    );

    // Tìm quận có nhiều đơn nhất
    const topDistrict =
      districtStats.sort((a, b) => b.count - a.count)[0]?.district ||
      "Không rõ";

    res.json({
      success: true,
      report: {
        salary,
        revenue,
        successCount: successOrders.length,
        failCount: failedOrders.length,
        successOrders: successOrders.length,
        failedOrders: failedOrders.length,
        salaryByMonth,
        cancelReasons,
        topDistrict,
        districtStats,
      },
    });
  } catch (error) {
    console.error("getShipperReport:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy báo cáo." });
  }
};

// Tăng số lượng đơn hàng hiện tại
const incrementOrderCount = async (req, res) => {
  try {
    const shipperId = req.user.id || req.user._id;

    const shipper = await shipperModel.findByIdAndUpdate(
      shipperId,
      { $inc: { currentOrders: 1 } },
      { new: true }
    );

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shipper.",
      });
    }

    res.json({
      success: true,
      currentOrders: shipper.currentOrders,
    });
  } catch (error) {
    console.log("incrementOrderCount: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giảm số lượng đơn hàng hiện tại
const decrementOrderCount = async (req, res) => {
  try {
    const shipperId = req.user.id || req.user._id;

    const shipper = await shipperModel.findById(shipperId);

    if (!shipper) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy shipper.",
      });
    }

    // Không cho currentOrders xuống dưới 0
    shipper.currentOrders = Math.max(0, shipper.currentOrders - 1);
    await shipper.save();

    res.json({
      success: true,
      currentOrders: shipper.currentOrders,
    });
  } catch (error) {
    console.log("decrementOrderCount: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createShipper,
  loginShipper,
  getAllShipper,
  getShipperById,
  getShipperOrders,
  getShipperReport,
  updateStatus,
  updateShipper,
  deleteShipper,
  incrementOrderCount,
  decrementOrderCount,
  changePassword,
};
