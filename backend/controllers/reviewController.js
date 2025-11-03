import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

// Tạo đánh giá mới
const createReview = async (req, res) => {
  const { product, rating, comment } = req.body;
  const userId = req.body.userId;

  if (!userId) {
    return res.status(401).json({ message: "Bạn cần phải đăng nhập" });
  }

  try {
    console.log("User ID:", userId);
    console.log("Product ID:", product);

    const reviewExists = await Review.findOne({
      product: product,
      user: userId,
    });

    console.log("Review Exists:", reviewExists);

    if (reviewExists) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const review = await Review.create({
      product,
      user: userId,
      rating,
      comment,
    });

    await updateAverageRating(product);

    res.status(201).json(review);
  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi tạo đánh giá", error: error.message });
  }
};

// Lấy danh sách đánh giá theo sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 });

    const totalReview = reviews.length;

    res.status(200).json({
      reviews,
      totalReview,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy đánh giá", error: err.message });
  }
};

// Cập nhật lại đánh giá trung bình của sản phẩm
const updateAverageRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(productId, {
      averageReview: averageRating,
      numReviews: reviews.length,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá trung bình:", error);
    throw new Error("Không thể cập nhật đánh giá trung bình");
  }
};

// Lấy tổng số đánh giá của sản phẩm
const getTotalReviews = async (productId) => {
  try {
    const totalReviews = await Review.countDocuments({ product: productId });
    return totalReviews;
  } catch (error) {
    console.error("Lỗi khi tính tổng số đánh giá:", error);
    throw new Error("Không thể tính tổng số đánh giá");
  }
};

// Lấy điểm đánh giá trung bình của sản phẩm
const getAverageReview = async (productId) => {
  try {
    const result = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: "$product", averageRating: { $avg: "$rating" } } },
    ]);

    const averageReview = result[0]?.averageRating || 0;
    return averageReview;
  } catch (error) {
    console.error("Lỗi khi tính điểm đánh giá trung bình:", error);
    throw new Error("Không thể tính điểm đánh giá trung bình");
  }
};

// Lấy tổng hợp thông tin về đánh giá sản phẩm
const getProductReviewsSummary = async (req, res) => {
  const { productId } = req.params;

  try {
    const totalReviews = await getTotalReviews(productId);
    const averageReview = await getAverageReview(productId);

    res.status(200).json({
      totalReviews,
      averageReview,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tổng hợp đánh giá:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin tổng hợp đánh giá" });
  }
};

const hasPurchased = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu productId",
      });
    }

    const order = await Order.findOne({
      userId,
      status: "Đã giao thành công",
      items: { $elemMatch: { _id: productId } },
    });

    res.json({
      success: true,
      purchased: !!order,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  createReview,
  getReviewsByProduct,
  getProductReviewsSummary,
  hasPurchased,
};
