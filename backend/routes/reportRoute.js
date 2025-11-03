import express from "express";
import {
  getRevenueAndSoldQuantity,
  getTotalCustomers,
  getReturnRate,
  getBestSellingProducts,
  getTopDistricts,
  getMonthlyRevenue,
  getYearlyRevenue,
  getTopCustomers,
} from "../controllers/reportController.js";
import adminAuth from "../middleware/adminAuth.js";

const reportRouter = express.Router();

// Tổng doanh thu và số lượng bán
reportRouter.get("/revenue", adminAuth, getRevenueAndSoldQuantity);

// Số lượng khách hàng
reportRouter.get("/customers", adminAuth, getTotalCustomers);

// Tỷ lệ hoàn hàng
reportRouter.get("/return-rate", adminAuth, getReturnRate);

// Sản phẩm bán chạy
reportRouter.get("/best-selling-products", adminAuth, getBestSellingProducts);

// Quận mua nhiều nhất
reportRouter.get("/top-districts", adminAuth, getTopDistricts);

// Doanh thu theo tháng
reportRouter.get("/monthly-revenue", adminAuth, getMonthlyRevenue);

// Doanh thu theo năm
reportRouter.get("/yearly-revenue", adminAuth, getYearlyRevenue);

// Khách hàng mua nhiều nhất
reportRouter.get("/top-customers", adminAuth, getTopCustomers);

export default reportRouter;
