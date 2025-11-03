import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// THÊM SẢN PHẨM VÀO GIỎ HÀNG
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size, color, price, image } = req.body;

    const userData = await userModel.findById(userId);
    if (!userData.cartData) {
      userData.cartData = {};
    }

    let cartData = userData.cartData;

    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    const sizeColorKey = `${size}-${color}`;

    const product = await productModel.findById(itemId);
    if (!product) {
      return res.json({ success: false, message: "Sản phẩm không tồn tại" });
    }

    const totalStock = product.totalStock || 0;

    const allUsers = await userModel.find({
      [`cartData.${itemId}.${sizeColorKey}`]: { $exists: true },
    });
    let totalQuantityInCarts = 0;

    allUsers.forEach((user) => {
      totalQuantityInCarts +=
        user.cartData?.[itemId]?.[sizeColorKey]?.quantity || 0;
    });

    if (totalQuantityInCarts >= totalStock) {
      return res.json({ success: false, message: "Sản phẩm đã hết hàng" });
    }

    if (!cartData[itemId][sizeColorKey]) {
      cartData[itemId][sizeColorKey] = { quantity: 1, price, image };
    } else {
      const currentQty = cartData[itemId][sizeColorKey].quantity;
      if (totalQuantityInCarts + 1 > totalStock) {
        return res.json({
          success: false,
          message: "Không thể thêm quá số lượng tồn kho",
        });
      }
      cartData[itemId][sizeColorKey].quantity = currentQty + 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CẬP NHẬT GIỎ HÀNG
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, color, quantity } = req.body;
    const sizeColorKey = `${size}-${color}`;

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData;

    if (!cartData[itemId] || !cartData[itemId][sizeColorKey]) {
      return res.json({
        success: false,
        message: "Sản phẩm không có trong giỏ.",
      });
    }

    const product = await productModel.findById(itemId);
    const totalStock = product.totalStock;

    const allUsers = await userModel.find({ _id: { $ne: userId } }, "cartData");

    let totalOtherUsers = 0;
    for (const user of allUsers) {
      if (
        user.cartData &&
        user.cartData[itemId] &&
        user.cartData[itemId][sizeColorKey]
      ) {
        totalOtherUsers += user.cartData[itemId][sizeColorKey].quantity || 0;
      }
    }

    if (totalOtherUsers + quantity > totalStock) {
      return res.json({
        success: false,
        message: "Không thể cập nhật vượt quá số lượng tồn kho.",
      });
    }

    cartData[itemId][sizeColorKey].quantity = quantity;
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// XÓA SẢN PHẨM KHỎI GIỎ HÀNG
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId, size, color } = req.body;

    if (!userId || !itemId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, itemId, size, or color.",
      });
    }

    const userData = await userModel.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let cartData = userData.cartData;
    const sizeColorKey = `${size}-${color}`;

    if (cartData[itemId] && cartData[itemId][sizeColorKey]) {
      delete cartData[itemId][sizeColorKey];

      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }

      await userModel.findByIdAndUpdate(userId, { cartData });

      res.json({ success: true, message: "Product removed from cart" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId);

    let cartData = await userData.cartData;

    res.json({ success: true, cartData });
  } catch (error) {}
};

export { addToCart, updateCart, getUserCart, removeFromCart };
