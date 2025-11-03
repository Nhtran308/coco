import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import voucherModel from "../models/voucherModel.js";
import Stripe from "stripe";
import axios from "axios";
import crypto from "crypto";
import nodemailer from "nodemailer";
import shipperModel from "../models/shipperModel.js";
import mongoose from "mongoose";

const currency = "vnd";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// COD
const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      address,
      voucherCode,
      paymentMethod,
      payment,
    } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      returned: false,
      paymentMethod: paymentMethod || "COD",
      payment: typeof payment === "boolean" ? payment : false,
      date: Date.now(),
      voucherCode: voucherCode || null,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    if (voucherCode) {
      const voucher = await voucherModel.findOne({ code: voucherCode });
      if (voucher) {
        voucher.usedBy.push(userId);
        voucher.usageCount = (voucher.usageCount || 0) + 1;
        await voucher.save();
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    sendInvoice(newOrder);

    await updateTotalStock(items);

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Momo
const placeOrderMomo = async (req, res) => {
  try {
    const { userId, items, amount, address, voucherCode } = req.body;
    const { origin } = req.headers;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Danh sách sản phẩm không hợp lệ." });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      returned: false,
      paymentMethod: "Momo",
      payment: false,
      date: Date.now(),
      voucherCode: voucherCode || null,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const productNames = items
      .map((item) => item.name || "Sản phẩm")
      .join(", ");
    const orderInfo = `Thanh toan: ${productNames}`;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const orderId = partnerCode + new Date().getTime();
    const requestId = orderId;
    const extraData = newOrder._id.toString();
    const requestType = "captureWallet";
    const autoCapture = true;
    const redirectUrl = "http://localhost:5173/verifyMomo";
    const ipnUrl =
      "https://78f1-115-76-231-2.ngrok-free.app/api/order/verifyMomo";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    const data = {
      partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      autoCapture,
      extraData,
      requestType,
      signature,
    };

    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      data,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data && response.data.payUrl) {
      res.json({ success: true, payUrl: response.data.payUrl });
    } else {
      res.status(400).json({
        success: false,
        message: response.data.message || "Không tạo được đơn MoMo",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const verifyMomo = async (req, res) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = req.body;

  try {
    if (!partnerCode || !orderId || !signature) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin." });
    }

    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${
      orderType || "momo_wallet"
    }&partnerCode=${partnerCode}&payType=${
      payType || "momo_wallet"
    }&requestId=${requestId}&responseTime=${responseTime}&resultCode=${String(
      resultCode
    )}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Chữ ký không hợp lệ." });
    }

    const orderIdFromDB = extraData;

    if (parseInt(resultCode, 10) === 0) {
      const order = await orderModel.findById(orderIdFromDB);
      if (!order)
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng.",
        });

      try {
        await updateTotalStock(order.items);
      } catch (err) {
        await orderModel.findByIdAndDelete(orderIdFromDB);
        return res.json({
          success: false,
          message: "Cập nhật tồn kho thất bại.",
        });
      }

      if (order.voucherCode) {
        const voucher = await voucherModel.findOne({ code: order.voucherCode });
        if (voucher) {
          const userObjectId = new mongoose.Types.ObjectId(order.userId);

          if (
            !voucher.usedBy.some(
              (id) => id.toString() === userObjectId.toString()
            )
          ) {
            voucher.usedBy.push(userObjectId);
            voucher.usageCount = (voucher.usageCount || 0) + 1;
            await voucher.save();
          } else {
            console.log("User đã dùng voucher trước đó.");
          }
        } else {
          console.log("Không tìm thấy voucher:", order.voucherCode);
        }
      }

      await Promise.all([
        orderModel.findByIdAndUpdate(orderIdFromDB, { payment: true }),
        userModel.findByIdAndUpdate(order.userId, { cartData: {} }),
      ]);

      const user = await userModel.findById(order.userId);
      if (!user)
        return res.json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });

      sendInvoice(order, user).catch((err) =>
        console.error("Lỗi gửi hóa đơn:", err.message)
      );

      return res.json({ success: true, message: "Thanh toán thành công." });
    } else {
      await orderModel.findByIdAndDelete(orderIdFromDB);
      return res.json({ success: false, message: "Thanh toán thất bại." });
    }
  } catch (err) {
    console.error("❌ Lỗi verifyMomo:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Stripe
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    const orderData = {
      userId,
      items,
      address,
      amount,
      returned: false,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const deliveryCharges = totalAmount >= 1000000 ? 0 : 50000;

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Van chuyen",
        },
        unit_amount: deliveryCharges,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Xac thuc stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng.",
        });
      }

      try {
        await updateTotalStock(order.items);
      } catch (err) {
        await orderModel.findByIdAndDelete(orderId);
        return res.json({ success: false, message: err.message });
      }

      await Promise.all([
        orderModel.findByIdAndUpdate(orderId, { payment: true }),
        userModel.findByIdAndUpdate(userId, { cartData: {} }),
      ]);

      const user = await userModel.findById(userId);
      if (!user) {
        return res.json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });
      }

      res.json({ success: true });

      sendInvoice(order, user).catch((err) =>
        console.error("Lỗi gửi hóa đơn:", err.message)
      );
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Data order for admin
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
};

const getShipperOrders = async (req, res) => {
  try {
    const shipperId = req.user.id;
    if (!shipperId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin shipper trong token.",
      });
    }

    const orders = await orderModel
      .find({
        shipperId,
        status: {
          $nin: [
            "Đã giao thành công",
            "Giao không thành công",
            "Yêu cầu hủy đơn",
            "Hủy đơn không thành công",
            "Hủy đơn thành công",
            "Đã hoàn hàng",
          ],
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi khi lấy đơn hàng của shipper:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const autoAssignOrdersToShipper = async (req, res) => {
  try {
    const shipperId = req.user.id;

    const shipper = await shipperModel.findById(shipperId);
    if (!shipper) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy shipper" });
    }

    const areaArray = shipper.area?.includes(",")
      ? shipper.area.split(",").map((a) => a.trim())
      : shipper.area?.trim()
      ? [shipper.area.trim()]
      : [];

    const regexConditions =
      shipper.area?.toLowerCase() === "all" || !shipper.area
        ? [{}]
        : areaArray.map((area) => ({
            "address.district": {
              $regex: area.replace(/^Quận\s*/i, ""),
              $options: "i",
            },
          }));

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const orders = await orderModel.aggregate([
      {
        $match: {
          status: "Đã đặt hàng",
          shipperId: null,
          paymentMethod: { $ne: "Offline" },
          $or: [
            {
              paymentStatus: "true",
            },
            {
              paymentStatus: "false",
              createdAt: { $lte: oneDayAgo },
            },
          ],
          $or: regexConditions,
        },
      },
      { $sample: { size: 10 } },
    ]);

    const orderIds = orders.map((order) => order._id);

    // Gán shipper cho các đơn này
    await orderModel.updateMany(
      { _id: { $in: orderIds } },
      { $set: { shipperId: shipperId } }
    );

    const updatedOrders = await orderModel.find({ _id: { $in: orderIds } });

    res.json({
      success: true,
      message: "Đã gán đơn hàng phù hợp cho shipper",
      orders: updatedOrders,
    });
  } catch (error) {
    console.error("Lỗi khi gán đơn hàng:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// Order user
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status, cancelReason, returned } = req.body;

    const validStatuses = [
      "Đã đặt hàng",
      "Đang xử lý",
      "Đang giao hàng",
      "Giao không thành công",
      "Đã giao thành công",
      "Hủy đơn thành công",
      "Hủy đơn không thành công",
      "Yêu cầu hủy đơn",
      "Yêu cầu hoàn hàng",
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

    const unCancelableStatuses = [
      "Đã giao thành công",
      "Hủy đơn thành công",
      "Hủy đơn không thành công",
    ];

    const updateData = { status };

    if (cancelReason) {
      updateData.cancelReason = cancelReason;
      if (status === "Yêu cầu hủy đơn") {
        updateData.cancelRequestedAt = new Date();
      }
    }

    if (returned !== undefined) {
      updateData.returned = returned;
    }

    if (status === "Hủy đơn thành công") {
      if (unCancelableStatuses.includes(existingOrder.status)) {
        return res.status(400).json({
          success: false,
          message: `Không thể hủy đơn ở trạng thái "${existingOrder.status}".`,
        });
      }

      const createdAt = new Date(existingOrder.createdAt);
      const now = new Date();
      const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

      if (diffInDays > 1) {
        return res.status(400).json({
          success: false,
          message: "Không thể hủy đơn hàng sau 1 ngày kể từ khi đặt.",
        });
      }

      updateData.cancelReason = cancelReason || "Không rõ lý do";

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

    if (status === "Yêu cầu hoàn hàng") {
      updateData.returned = true;
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

const sendInvoice = async (order) => {
  try {
    if (!order) {
      console.error("Không tìm thấy đơn hàng.");
      return;
    }

    const { items, amount, address } = order;
    const { fullName, email, phone, houseNumber, ward, district, province } =
      address;

    const totalAmount = amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

    const fullAddress = `${houseNumber}, ${ward}, ${district}, ${province}`;

    const productList = items
      .map(
        (item) => `
      <li>
        <strong>${item.name}</strong>: ${item.price.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })} x ${item.quantity}
      </li>
    `
      )
      .join("");

    const invoiceHTML = `
      <html>
        <body>
          <h1>Hóa đơn đặt hàng</h1>
          <p><strong>Họ tên:</strong> ${fullName}</p>
          <p><strong>Số điện thoại:</strong> ${phone}</p>
          <p><strong>Địa chỉ giao hàng:</strong> ${fullAddress}</p>
          <h2>Chi tiết sản phẩm</h2>
          <ul>
            ${productList}
          </ul>
          <p><strong>Tổng cộng:</strong> ${totalAmount}</p>
        </body>
      </html>
    `;

    const productImage = items[0].image[0];

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Hóa đơn đặt hàng của bạn",
      html: invoiceHTML,
      attachments: [
        {
          filename: "product-image.jpg",
          path: productImage,
          cid: "product-image",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Hóa đơn đã được gửi đến email của bạn.");
  } catch (error) {
    console.error("Lỗi gửi hóa đơn:", error.message);
  }
};

const updateTotalStock = async (items) => {
  for (const item of items) {
    const product = await productModel.findById(item._id);
    if (!product) continue;

    if (product.totalStock < item.quantity) {
      throw new Error(`Sản phẩm "${product.name}" không đủ hàng.`);
    }

    product.totalStock -= item.quantity;
    await product.save();
  }
};

export {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  placeOrderMomo,
  verifyMomo,
  sendInvoice,
  getShipperOrders,
  autoAssignOrdersToShipper,
};
