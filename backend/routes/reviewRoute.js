import express from "express";
import authUser from "../middleware/userAuth.js";
import {
  createReview,
  getReviewsByProduct,
  getProductReviewsSummary,
  hasPurchased, // Import the new controller function
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", authUser, createReview);

reviewRouter.get("/:productId", getReviewsByProduct);

reviewRouter.get("/summary/:productId", getProductReviewsSummary);

reviewRouter.post("/has-purchased", authUser, hasPurchased);

export default reviewRouter;
