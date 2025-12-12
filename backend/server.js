import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import voucherRouter from "./routes/voucherRoute.js";
import reportRouter from "./routes/reportRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import shipperRouter from "./routes/shipperRoute.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://coco-frontend.onrender.com"
    ],
    credentials: true,
  })
);


app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/voucher", voucherRouter);
app.use("/api/report", reportRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/shipper", shipperRouter);

app.get("/", (req, res) => {
  res.send("API is working!");
});

const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();
    app.listen(port, () => {
      console.log(`Server started on PORT: ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
