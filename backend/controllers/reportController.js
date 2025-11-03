import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Hàm tính tổng doanh thu
const getTotalRevenue = async () => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    return result[0]?.totalRevenue || 0;
  } catch (error) {
    throw new Error("Error in getTotalRevenue: " + error.message);
  }
};

// Hàm tính tổng số lượng bán
const getTotalSoldQuantity = async () => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      { $unwind: "$items" },
      { $match: { "items.quantity": { $exists: true } } },
      { $addFields: { "items.quantity": { $toInt: "$items.quantity" } } },
      { $group: { _id: null, totalQuantitySold: { $sum: "$items.quantity" } } },
    ]);
    return result.length > 0 ? result[0].totalQuantitySold : 0;
  } catch (error) {
    throw new Error("Error in getTotalSoldQuantity: " + error.message);
  }
};

// Tổng hợp doanh thu và số lượng bán
const getRevenueAndSoldQuantity = async (req, res) => {
  try {
    const totalRevenue = await getTotalRevenue();
    const totalQuantitySold = await getTotalSoldQuantity();
    return res
      .status(200)
      .json({ success: true, totalRevenue, totalQuantitySold });
  } catch (error) {
    console.error("Error in getRevenueAndSoldQuantity:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Lỗi server" });
  }
};

// Tổng số khách hàng
const getTotalCustomers = async (req, res) => {
  try {
    const result = await userModel.countDocuments({ role: "user" });
    return res.status(200).json({ success: true, totalCustomers: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Tỷ lệ hoàn hàng
const getReturnRate = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const returnedOrders = await orderModel.countDocuments({
      status: "Hủy đơn thành công",
    });
    const returnRate =
      totalOrders > 0 ? (returnedOrders / totalOrders) * 100 : 0;
    return res
      .status(200)
      .json({ success: true, returnRate: returnRate.toFixed(2) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Sản phẩm bán chạy
const getBestSellingProducts = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: { $toInt: "$items.quantity" } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
    return res.status(200).json({ success: true, products: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Quận mua nhiều nhất
const getTopDistricts = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      { $group: { _id: "$address.district", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
    ]);
    return res.status(200).json({ success: true, districts: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Doanh thu theo tháng
const getMonthlyRevenue = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      {
        $project: { month: { $month: "$createdAt" }, totalRevenue: "$amount" },
      },
      { $group: { _id: "$month", totalRevenue: { $sum: "$totalRevenue" } } },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", totalRevenue: 1, _id: 0 } },
    ]);
    return res.status(200).json({ success: true, monthlyRevenue: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Doanh thu theo năm
const getYearlyRevenue = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      { $project: { year: { $year: "$date" }, totalRevenue: "$amount" } },
      { $group: { _id: "$year", totalRevenue: { $sum: "$totalRevenue" } } },
      { $sort: { _id: 1 } },
      { $project: { year: "$_id", totalRevenue: 1, _id: 0 } },
    ]);
    return res.status(200).json({ success: true, yearlyRevenue: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Khách hàng mua nhiều nhất
const getTopCustomers = async (req, res) => {
  try {
    const result = await orderModel.aggregate([
      { $match: { status: "Đã giao thành công" } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$amount" },
          totalOrders: { $sum: 1 },
          fullName: { $first: "$address.fullName" },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);
    return res.status(200).json({ success: true, topCustomers: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getRevenueAndSoldQuantity,
  getTotalCustomers,
  getReturnRate,
  getBestSellingProducts,
  getTopDistricts,
  getMonthlyRevenue,
  getYearlyRevenue,
  getTopCustomers,
};
