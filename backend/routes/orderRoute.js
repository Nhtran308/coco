import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  placeOrderMomo,
  verifyMomo,
  getShipperOrders,
  autoAssignOrdersToShipper,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import shipperAuth from "../middleware/shipperAuth.js";

const orderRouter = express.Router();

//Admin Features
orderRouter.post("/status", updateStatus);
orderRouter.post("/sale", adminAuth, updateStatus);
orderRouter.post("/list", adminAuth, allOrders);

//Shipper Features
orderRouter.post("/assign", shipperAuth, autoAssignOrdersToShipper);
orderRouter.get("/my-orders", shipperAuth, getShipperOrders);

//Payment Features
orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/stripe", userAuth, placeOrderStripe);
orderRouter.post("/momo", userAuth, placeOrderMomo);

//User Feature
orderRouter.post("/user-orders", userAuth, userOrders);

//Xac thuc thanh toan
orderRouter.post("/verifyStripe", userAuth, verifyStripe);
orderRouter.post("/verifyMomo", verifyMomo);
export default orderRouter;
