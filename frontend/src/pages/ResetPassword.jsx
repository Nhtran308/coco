import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { FaLock } from "react-icons/fa";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { backendUrl } = useContext(ShopContext);
  const { token } = useParams(); // Lấy token từ URL
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp.");
      return;
    }

    // Kiểm tra dữ liệu trước khi gửi yêu cầu
    console.log("Sending reset password request with data:", { password });

    try {
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/user/reset-password/${token}`,
        { password } // Gửi password trong body
      );

      if (response.data.success) {
        toast.success(response.data.message || "Đổi mật khẩu thành công!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Error while resetting password:", error.message);
      toast.error("Lỗi đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[480px] mt-20 flex items-center justify-center">
      <form
        onSubmit={handleResetPassword}
        className="bg-white text-gray-600 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0_0_10px_0] shadow-black/10"
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          ĐẶT LẠI MẬT KHẨU
        </h2>

        <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-2 pl-2">
          <FaLock className="text-gray-600 opacity-60" size={18} />
          <input
            className="w-full outline-none bg-transparent py-2.5"
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center mt-2 mb-6 border bg-indigo-500/5 border-gray-500/10 rounded gap-2 pl-2">
          <FaLock className="text-gray-600 opacity-60" size={18} />
          <input
            className="w-full outline-none bg-transparent py-2.5"
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mb-3 transition-all active:scale-95 py-2.5 rounded text-white font-medium ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600"
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
