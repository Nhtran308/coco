import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaKey } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendUrl } from "../App";

const Profile = ({ token }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [shipperData, setShipperData] = useState({
    name: "",
    phone: "",
    email: "",
    nationalId: "",
    licenseNumber: "",
    vehicleNumber: "",
  });

  const loadShipperData = async () => {
    if (!token) {
      console.warn("Không có token!");
      return;
    }
    try {
      const response = await axios.get(`${backendUrl}/api/shipper/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setShipperData(response.data.data);
      } else {
        console.error("Không tải được dữ liệu shipper:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Lỗi khi tải dữ liệu người dùng:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.post(
        backendUrl + "/api/shipper/update",
        shipperData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        toast.success("Cập nhật thành công");
        setIsEditing(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật");
    }
  };

  useEffect(() => {
    loadShipperData();
  }, [token]);

  if (loading) return <p className="text-center">Đang tải dữ liệu...</p>;
  if (!shipperData)
    return (
      <p className="text-center text-red-500">Không có dữ liệu người dùng.</p>
    );

  const { name, phone, email, nationalId, vehicleNumber, licenseNumber } =
    shipperData;

  return (
    <div className=" min-h-screen py-10 px-4">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          THÔNG TIN CÁ NHÂN
        </h1>

        {/* Họ và tên */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={name || ""}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditing}
            onChange={(e) =>
              setShipperData({ ...shipperData, name: e.target.value })
            }
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="text"
            value={phone || ""}
            className="w-full border rounded-lg p-3 text-gray-800 bg-gray-100"
            readOnly
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            value={email || ""}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditing}
            onChange={(e) =>
              setShipperData({ ...shipperData, email: e.target.value })
            }
          />
        </div>

        {/* CCCD */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            CCCD
          </label>
          <input
            type="text"
            value={nationalId || ""}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditing}
            onChange={(e) =>
              setShipperData({ ...shipperData, nationalId: e.target.value })
            }
          />
        </div>

        {/* Biển số xe */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Biển số xe
          </label>
          <input
            type="text"
            value={vehicleNumber || ""}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditing}
            onChange={(e) =>
              setShipperData({ ...shipperData, vehicleNumber: e.target.value })
            }
          />
        </div>

        {/* GPLX */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Giấy phép lái xe (GPLX)
          </label>
          <input
            type="text"
            value={licenseNumber || ""}
            className="w-full border rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            readOnly={!isEditing}
            onChange={(e) =>
              setShipperData({ ...shipperData, licenseNumber: e.target.value })
            }
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <button
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => (isEditing ? handleUpdate() : setIsEditing(true))}
          >
            <FaEdit className="inline mr-2" />
            {isEditing ? "Cập nhật" : "Chỉnh sửa thông tin"}
          </button>

          <button
            className="w-full sm:w-auto bg-yellow-500 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-600 transition"
            onClick={() => navigate("/change-password")}
          >
            <FaKey className="inline mr-2" />
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
