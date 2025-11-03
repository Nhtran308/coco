import express from "express";
import {
  createVoucher,
  applyVoucher,
  usedVoucher,
  getVoucher,
} from "../controllers/voucherController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/userAuth.js";

const voucherRouter = express.Router();

voucherRouter.post("/create", adminAuth, createVoucher);
voucherRouter.post("/apply", authUser, applyVoucher);
voucherRouter.post("/mark-used", adminAuth, usedVoucher);
voucherRouter.get("/voucher/:code", getVoucher);

export default voucherRouter;
