import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Thêm sản phẩm
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      salePrice,
      brand,
      totalStock,
      category,
      subCategory,
      colors,
      sizes,
      bestseller,
    } = req.body;

    const existingProduct = await productModel.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Sản phẩm đã tồn tại!",
      });
    }

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      salePrice,
      brand,
      totalStock,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      colors: JSON.parse(colors),
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "ĐÃ THÊM SẢN PHẨM" });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Hiển thị sản phẩm
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Chỉnh sửa sản phẩm
const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy ID sản phẩm",
      });
    }

    const {
      name,
      description,
      price,
      salePrice,
      brand,
      totalStock,
      totalSold,
      category,
      subCategory,
      colors,
      sizes,
      bestseller,
    } = req.body;

    const findProduct = await productModel.findById(productId);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại",
      });
    }

    findProduct.name = name || findProduct.name;
    findProduct.description = description || findProduct.description;
    findProduct.price = price || findProduct.price;
    findProduct.salePrice = salePrice || findProduct.salePrice;
    findProduct.brand = brand || findProduct.brand;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.category = category || findProduct.category;
    findProduct.subCategory = subCategory || findProduct.subCategory;
    findProduct.colors = Array.isArray(colors) ? colors : findProduct.colors;
    findProduct.sizes = Array.isArray(sizes) ? sizes : findProduct.sizes;
    findProduct.bestseller =
      bestseller !== undefined ? bestseller : findProduct.bestseller;

    await findProduct.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: findProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: `Lỗi khi cập nhật sản phẩm: ${
        error.message || "Không xác định"
      }`,
    });
  }
};

// Xóa sản phẩm
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed " });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Thông tin sản phẩm
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, listProducts, removeProduct, singleProduct, editProduct };
