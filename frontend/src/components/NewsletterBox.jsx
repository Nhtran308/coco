import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const NewsletterBox = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Lấy token từ localStorage hoặc sessionStorage (hoặc cookie nếu bạn dùng)
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await axios.post(
          `${backendUrl}/api/user/profile`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Gửi token qua header Authorization
            },
          }
        );

        if (response.data.success) {
          setIsSubscribed(response.data.user.isSubscribed);
          if (response.data.user.isSubscribed) {
            localStorage.setItem("isSubscribed", "true");
          } else {
            localStorage.removeItem("isSubscribed");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Lỗi khi lấy thông tin người dùng.");
      }
    };

    fetchUserProfile();
  }, []);

  const onSubmitHandle = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/subscribe`, {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Đăng ký thành công!");
        setEmail("");
        setIsSubscribed(true);
        localStorage.setItem("isSubscribed", "true"); // Lưu trạng thái đăng ký vào localStorage
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Lỗi khi đăng ký nhận ưu đãi.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) return null; // Nếu đã đăng ký, không hiển thị hộp thoại nữa

  return (
    <div className="text-center px-4">
      <p className="text-2xl font-semibold text-gray-800 mb-6">
        Đăng ký thành viên để nhận ưu đãi giảm giá đặc biệt!
      </p>

      <form
        onSubmit={onSubmitHandle}
        className="w-full sm:w-[500px] mx-auto flex flex-col sm:flex-row items-stretch gap-3 bg-white border border-gray-300 shadow-md rounded-lg p-3"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          required
          className="flex-1 py-3 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-700"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-gray-900 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? "ĐANG GỬI..." : "ĐĂNG KÝ"}
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;
