import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { backendUrl } from "../App";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp!");
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/api/shipper/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi khi đổi mật khẩu!");
    }
  };

  const renderPasswordInput = (label, value, setValue, show, setShow) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={label}
        className="w-full p-3 pr-10 border rounded-lg"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div
        className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
        onClick={() => setShow(!show)}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </div>
    </div>
  );
  useEffect(() => {
    console.log("Token gửi đi:", token);
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-center">Đổi mật khẩu</h2>
        <div className="space-y-4">
          {renderPasswordInput(
            "Mật khẩu hiện tại",
            currentPassword,
            setCurrentPassword,
            showCurrent,
            setShowCurrent
          )}
          {renderPasswordInput(
            "Mật khẩu mới",
            newPassword,
            setNewPassword,
            showNew,
            setShowNew
          )}
          {renderPasswordInput(
            "Nhập lại mật khẩu mới",
            confirmPassword,
            setConfirmPassword,
            showConfirm,
            setShowConfirm
          )}
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Cập nhật mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
