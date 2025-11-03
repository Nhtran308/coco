import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { useLocation } from "react-router-dom";

const CartTotal = () => {
  const {
    currency,
    delivery_fee,
    getCartAmount,
    discount,
    setDiscount,
    getCartCount,
    backendUrl,
  } = useContext(ShopContext);

  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const location = useLocation();
  const isCartPage = location.pathname === "/cart";
  const subtotal = getCartAmount();
  const shippingFee =
    getCartCount() === 0 ? 0 : subtotal >= 1000000 ? 0 : Number(delivery_fee);
  const discountAmount = discount;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyVoucher = async () => {
    if (!discountCode) {
      setDiscountError("Vui lòng nhập mã giảm giá.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      console.log("Token from localStorage:", token);

      if (!token) {
        setDiscountError("Bạn cần đăng nhập để áp dụng mã giảm giá.");
        return;
      }

      const response = await fetch(`${backendUrl}/api/voucher/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: discountCode,
          cartTotal: subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setDiscountError(data.message || "Mã giảm giá không hợp lệ.");
        return;
      }

      setDiscount(data.discountAmount);
      setDiscountError("");
      localStorage.setItem("voucherCode", discountCode);
    } catch (error) {
      console.error("Lỗi khi áp dụng mã:", error);
      setDiscountError("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-md">
      <div className="text-xl font-semibold text-gray-800 mb-4">
        <Title text1="THÀNH" text2="TIỀN" />
      </div>

      <div className="flex flex-col gap-4 text-sm text-gray-700">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="font-medium">Tạm tính</span>
          <span>
            {subtotal.toLocaleString("vi-VN")} {currency}
          </span>
        </div>

        {/* Shipping Fee */}
        <div className="flex justify-between">
          <span className="font-medium">Phí vận chuyển</span>
          <span>
            {getCartCount() === 0
              ? "0 VND"
              : shippingFee === 0
              ? "Miễn phí"
              : `${shippingFee.toLocaleString("vi-VN")} VND`}
          </span>
        </div>

        {/* Mã giảm giá */}
        {!isCartPage && (
          <>
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium">Mã giảm giá</span>
              <div className="flex gap-2 w-3/4">
                <input
                  type="text"
                  placeholder="Nhập mã"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="border border-gray-300 px-3 py-1 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-[#567C8D]"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    applyVoucher();
                  }}
                  className="min-w-[70px] bg-[#567C8D] text-white px-2 py-0.5 rounded-md text-xs hover:bg-[#466b77] transition"
                >
                  Áp dụng
                </button>
              </div>
            </div>
            {discountError && (
              <p className="text-red-500 text-xs mt-1">{discountError}</p>
            )}
          </>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="font-medium">Giảm giá</span>
            <span>
              {discount.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
        )}

        <hr className="my-2" />

        {/* Total */}
        <div className="text-base font-bold text-gray-800">
          <p className="text-xs text-red-600 italic font-light mb-1">
            *Hóa đơn trên 1.000.000đ sẽ được miễn phí vận chuyển
          </p>

          <div className="flex justify-between">
            <span>Tổng cộng</span>
            <span>
              {totalAmount.toLocaleString("vi-VN")} {currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
