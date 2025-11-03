import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import shipperAuth from "../middleware/shipperAuth.js";
import {
  createShipper,
  decrementOrderCount,
  getShipperById,
  getShipperOrders,
  getShipperReport,
  incrementOrderCount,
  loginShipper,
  updateShipper,
  updateStatus,
  changePassword,
  getAllShipper,
  deleteShipper,
} from "../controllers/shipperController.js";

const shipperRouter = express.Router();

shipperRouter.post("/create", adminAuth, createShipper);
shipperRouter.post("/login", loginShipper);
shipperRouter.post("/update-status", shipperAuth, updateStatus);
shipperRouter.put("/increment", shipperAuth, incrementOrderCount);
shipperRouter.put("/decrement", shipperAuth, decrementOrderCount);
shipperRouter.get("/list", shipperAuth, getShipperOrders);
shipperRouter.get("/report", shipperAuth, getShipperReport);
shipperRouter.get("/profile", shipperAuth, getShipperById);
shipperRouter.post("/update", shipperAuth, updateShipper);
shipperRouter.put("/change-password", shipperAuth, changePassword);
shipperRouter.get("/employee", adminAuth, getAllShipper);
shipperRouter.delete("/delete/:id", adminAuth, deleteShipper);

export default shipperRouter;
