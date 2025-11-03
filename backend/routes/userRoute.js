import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  userProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  subscribeVoucher,
  checkUserSubcribe,
  changePassword,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/profile", userProfile);
userRouter.get("/profile", userProfile);
userRouter.put("/update", updateUserProfile);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password/:token", resetPassword);
userRouter.post("/subscribe", subscribeVoucher);
userRouter.post("/check-subscription", checkUserSubcribe);
userRouter.put("/change-password", changePassword);

export default userRouter;
