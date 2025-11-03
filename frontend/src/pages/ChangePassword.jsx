import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";

const ChangePassword = () => {
  const { navigate, backendUrl } = useContext(ShopContext);
  const token = localStorage.getItem("token");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp.");
      return;
    }

    if (!token) {
      toast.error("Không tìm thấy token đăng nhập.");
      return;
    }

    console.log("Sending to backend:", {
      oldPassword,
      newPassword,
      confirmPassword,
      token,
    });

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/change-password`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      if (response.data && response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        toast.error(
          response.data?.message || "Có lỗi xảy ra khi đổi mật khẩu."
        );
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      if (error.response) {
        console.log("Chi tiết lỗi từ backend:", error.response.data);
        toast.error(
          error.response.data?.message || "Đổi mật khẩu thất bại từ máy chủ."
        );
      } else {
        toast.error("Không thể kết nối đến máy chủ.");
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleChange = (field) => (e) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <ToastContainer />
      <h2 className="text-xl font-semibold text-center mb-6">
        Thay đổi mật khẩu
      </h2>

      <div className="space-y-4">
        {/* Old password */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showPassword.old ? "text" : "password"}
              className="w-full border rounded-lg p-3 pr-10"
              value={passwordData.oldPassword}
              onChange={handleChange("oldPassword")}
            />
            <span
              className="absolute right-3 top-3.5 text-gray-600 cursor-pointer"
              onClick={() => togglePassword("old")}
            >
              {showPassword.old ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* New password */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              className="w-full border rounded-lg p-3 pr-10"
              value={passwordData.newPassword}
              onChange={handleChange("newPassword")}
            />
            <span
              className="absolute right-3 top-3.5 text-gray-600 cursor-pointer"
              onClick={() => togglePassword("new")}
            >
              {showPassword.new ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              className="w-full border rounded-lg p-3 pr-10"
              value={passwordData.confirmPassword}
              onChange={handleChange("confirmPassword")}
            />
            <span
              className="absolute right-3 top-3.5 text-gray-600 cursor-pointer"
              onClick={() => togglePassword("confirm")}
            >
              {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between space-x-4">
          <button
            className="w-1/2 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 transition"
            onClick={handleCancel}
          >
            Hủy
          </button>

          <button
            className="w-1/2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
            onClick={handleChangePassword}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
