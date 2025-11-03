import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProduct";
import axios from "axios";
import { toast } from "react-toastify";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl, token } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [price, setPrice] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [totalReview, setTotalReview] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasPurchased = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/api/reviews/has-purchased`,
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Kết quả kiểm tra đã mua:", response.data);

      if (response.data.success) {
        setPurchased(response.data.purchased);
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra mua hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/reviews/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(response.data.reviews);
      setTotalReview(response.data.totalReview);
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchProductData = () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      if (product !== productData) {
        setProductData(product);
      }
      if (product.image[0] !== image) {
        setImage(product.image[0]);
      }
      setPrice(product.price);
    }
  };

  const handleReviewSubmit = async () => {
    if (newRating === 0 || newComment.trim() === "") {
      toast.error(
        "Vui lòng chọn số sao và nhập nội dung đánh giá trước khi gửi."
      );
      return;
    }

    const reviewData = {
      product: productId,
      rating: newRating,
      comment: newComment.trim(),
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewRating(0);
      setNewComment("");
      toast.success("Đánh giá thành công!");
      fetchReviews();
      fetchProductData();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("Bạn đã đánh giá sản phẩm này rồi.");
      } else {
        toast.error("Có lỗi xảy ra khi gửi đánh giá.");
      }

      console.error(
        "Error submitting review:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (products.length > 0 && productId) {
      fetchProductData();
      fetchReviews();
    }
  }, [productId, products]);

  useEffect(() => {
    setNewRating(0);
    setNewComment("");
  }, [productId]);

  useEffect(() => {
    console.log("productId hiện tại là:", productId);
    if (productId) {
      console.log("Gọi hàm hasPurchased với productId:", productId);
      hasPurchased();
    }
  }, [productId]);

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-4 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] gap-2 sm:gap-3 sm:w-[18%] w-full px-1">
            {productData.image.map((item, index) => (
              <img
                key={index}
                onClick={() => setImage(item)}
                src={item}
                alt={`Thumbnail ${index}`}
                className={`w-[24%] sm:w-full aspect-square object-cover cursor-pointer rounded-md border-2 transition duration-200 ${
                  image === item
                    ? "border-black"
                    : "border-transparent hover:border-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="w-full sm:w-[82%]">
            <div className="w-full aspect-[4/3] sm:aspect-square border rounded-md overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={image}
                alt="Main Product"
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 relative text-gray-800">
          {/* Title */}
          <h1 className="font-semibold text-3xl mt-2">{productData.name}</h1>

          {/* Đánh giá */}
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const average = productData.averageReview || 0;
              const isFilled = star <= Math.round(average);

              return (
                <img
                  key={star}
                  src={isFilled ? assets.star_icon : assets.star_dull_icon}
                  alt="star"
                  className="w-4 h-4"
                />
              );
            })}
            <p className="ml-2 text-sm text-gray-500">({totalReview})</p>
          </div>

          {/* Giá */}
          <div className="mt-6 flex items-center gap-4">
            {productData.salePrice < productData.price ? (
              <>
                <p className="text-3xl font-bold text-red-600">
                  {productData.salePrice.toLocaleString("vi-VN")} {currency}
                </p>
                <p className="text-lg line-through text-gray-400">
                  {productData.price.toLocaleString("vi-VN")} {currency}
                </p>
              </>
            ) : (
              <p className="text-3xl font-bold">
                {productData.price.toLocaleString("vi-VN")} {currency}
              </p>
            )}
          </div>

          {/* Màu sắc */}
          <div className="mt-8">
            <p className="text-sm font-medium mb-2">Màu sắc:</p>
            <div className="flex gap-3">
              {productData.colors.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setColor(color === item ? "" : item)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-2 transition duration-200 ${
                    color === item ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: item.toLowerCase() }}
                >
                  {color === item && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Kích cỡ */}
          <div className="mt-8">
            <p className="text-sm font-medium mb-2">Kích thước:</p>
            <div className="flex gap-3 flex-wrap">
              {productData.sizes.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSize(size === item ? "" : item)}
                  className={`border px-4 py-2 rounded-md transition text-sm font-medium ${
                    item === size
                      ? "bg-orange-500 text-white border-orange-600"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 max-w-xs">
            {productData.totalStock > 10 ? (
              <>
                <button
                  onClick={() =>
                    addToCart(productData._id, size, color, price, image)
                  }
                  className="bg-rred hover:bg-red-700 text-white px-6 py-3 rounded-md text-sm transition"
                >
                  THÊM VÀO GIỎ HÀNG
                </button>

                {productData.totalStock > 10 && productData.totalStock < 20 && (
                  <span className="right-2 top-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded z-20 text-center">
                    CÒN {Math.max(0, productData.totalStock - 10)} SẢN PHẨM
                  </span>
                )}
              </>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-6 py-3 rounded-md text-sm cursor-not-allowed"
              >
                HẾT HÀNG
              </button>
            )}
          </div>

          {/* Chính sách */}
          <hr className="mt-10 mb-4 sm:w-4/5" />
          <div className="text-sm text-gray-500 space-y-1">
            <p>🔁 Đổi trả cực dễ chỉ cần số điện thoại</p>
            <p>🕒 60 ngày đổi trả vì bất kỳ lý do gì</p>
            <p>📦 Đến tận nơi nhận hàng trả, hoàn tiền trong 24h</p>
          </div>
        </div>
      </div>

      {/* Mô tả sản phẩm */}
      <div className="mt-16">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-navy uppercase tracking-wide">
            Mô tả sản phẩm
          </h2>
          <div className="flex-1 h-px bg-gray-200 ml-4" />
        </div>

        <div className="rounded-xl shadow-sm bg-white px-6 py-5 text-base text-gray-800 leading-relaxed whitespace-pre-line border border-gray-100">
          {productData.description}
        </div>
      </div>

      {/* Đánh giá sản phẩm */}
      <div className="mt-14">
        <h2 className="text-lg font-semibold text-navy uppercase tracking-wide mb-4">
          Đánh giá sản phẩm
        </h2>

        {/* Đánh giá trung bình */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-400 text-xl">
            {"★".repeat(Math.round(productData.averageReview)) +
              "☆".repeat(5 - Math.round(productData.averageReview))}
          </span>
          <span className="text-sm text-gray-600">
            ({productData.averageReview.toFixed(1)}/5 từ {totalReview} đánh giá)
          </span>
        </div>

        {/* Danh sách đánh giá */}
        <div className="space-y-4">
          {isLoadingReviews ? (
            <p>Đang tải đánh giá...</p>
          ) : reviews.length === 0 ? (
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800">
                    {review.user.fullName}
                  </span>
                  <span className="text-yellow-400 text-base">
                    {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Form nhập đánh giá */}
        {purchased && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-semibold text-gray-800 mb-2">
              Viết đánh giá của bạn
            </h4>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setNewRating(star)}
                  className={`cursor-pointer text-2xl transition ${
                    newRating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows="3"
              placeholder="Đánh giá của bạn..."
            />
            <button
              onClick={handleReviewSubmit}
              disabled={newRating === 0 || newComment.trim() === ""}
              className={`mt-3 px-4 py-2 rounded-md text-sm font-medium text-white transition ${
                newRating === 0 || newComment.trim() === ""
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Gửi đánh giá
            </button>
          </div>
        )}
      </div>

      {/* Display Related Product */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
