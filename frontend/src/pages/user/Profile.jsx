import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import { Title } from "../../components/user";

const Profile = () => {
  const { backendUrl, token } = useContext(ShopContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwordData;
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không trùng khớp.");
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowChangePassword(false);
      } else {
        toast.error(response.data.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi khi đổi mật khẩu!");
      console.error("Change password error:", error.message);
    }
  };

  const loadUserData = async () => {
    if (!token) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/profile`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        console.error("Không tải được dữ liệu user:", response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu người dùng:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!userData) return;
    try {
      const response = await axios.put(
        `${backendUrl}/api/user/update`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsEditing(false);
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error("Cập nhật thông tin thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error.message);
      toast.error("Đã xảy ra lỗi khi cập nhật.");
    }
  };

  useEffect(() => {
    loadUserData();
  }, [token]);

  if (loading) return <p className="text-center">Đang tải dữ liệu...</p>;
  if (!userData)
    return (
      <p className="text-center text-red-500">Không có dữ liệu người dùng.</p>
    );

  const { fullName, email, address } = userData;

  return (
    <div className="border-t pt-16 bg-gray-50 min-h-screen">
      <ToastContainer />
      <div className="text-2xl font-semibold text-center mb-6">
        <Title text1={"THÔNG TIN"} text2={"KHÁCH HÀNG"} />
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center px-4 md:px-8">
        <div className="flex-1 space-y-6 bg-white shadow-lg rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ tên
            </label>
            <input
              type="text"
              value={fullName || ""}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              readOnly={!isEditing}
              onChange={(e) =>
                setUserData({ ...userData, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="w-full border rounded-lg p-3 bg-gray-100">
              {email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={address?.phone || ""}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              readOnly={!isEditing}
              title="Vui lòng nhập 10 chữ số"
              maxLength="10"
              onChange={(e) =>
                setUserData({
                  ...userData,
                  address: { ...address, phone: e.target.value },
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số nhà
              </label>
              <input
                type="text"
                value={address?.houseNumber || ""}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                readOnly={!isEditing}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: { ...address, houseNumber: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phường/Xã
              </label>
              <input
                type="text"
                value={address?.ward || ""}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                readOnly={!isEditing}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: { ...address, ward: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện
              </label>
              <input
                type="text"
                value={address?.district || ""}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                readOnly={!isEditing}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: { ...address, district: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                value={address?.province || ""}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                readOnly={!isEditing}
                onChange={(e) =>
                  setUserData({
                    ...userData,
                    address: { ...address, province: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-4">
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition"
              onClick={() => (isEditing ? handleUpdate() : setIsEditing(true))}
            >
              <FaEdit className="inline mr-2" />
              {isEditing ? "Cập nhật" : "Chỉnh sửa thông tin"}
            </button>

            <Link to="/change-password">
              <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition">
                Đổi mật khẩu
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
