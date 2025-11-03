import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { exportToExcel } from "../utils/exportToExcel";

import exportPDF from "../utils/exportToPDF";

const Employee = ({ token }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [area, setArea] = useState([]);
  const [list, setList] = useState([]);

  const handleCreateShipper = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !password.trim() ||
      !nationalId.trim() ||
      !vehicleNumber.trim() ||
      !licenseNumber.trim() ||
      !area.trim()
    ) {
      toast.error(response.data?.message || "Tạo tài khoản không thành công!");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/shipper/create",
        {
          name,
          phone,
          email,
          password,
          nationalId,
          vehicleNumber,
          licenseNumber,
          area,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Tạo tài khoản thành công!");
        setName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setNationalId("");
        setVehicleNumber("");
        setLicenseNumber("");
        setArea([]);
      } else {
        toast.error("Tạo tài khoản không thành công!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Đã xảy ra lỗi tạo tài khoản!");
    }
  };

  const fetchShippers = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/shipper/employee", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error(
          response.data.message || "Không thể tải danh sách nhân viên"
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi tải danh sách nhân viên");
    }
  };

  const handleDeleteShipper = async (id) => {
    try {
      const confirm = window.confirm("Bạn có chắc chắn muốn xóa shipper này?");
      if (!confirm) return;

      const response = await axios.delete(
        `${backendUrl}/api/shipper/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Xóa shipper thành công!");
        fetchShippers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi xóa shipper!");
    }
  };

  const handleExportExcel = () => {
    const exportData = list.map((shipper) => ({
      "Tên shipper": shipper.name,
      "Số điện thoại": shipper.phone,
      Email: shipper.email,
      "CMND/CCCD": shipper.nationalId,
      "Biển số xe": shipper.vehicleNumber,
      "Khu vực giao hàng": shipper.area,
    }));

    exportToExcel(exportData, "DanhSachShipper.xlsx", "Shipper");
  };
  const handleExportPDF = () => {
    const exportData = list.map((shipper) => ({
      name: shipper.name,
      phone: shipper.phone,
      email: shipper.email,
      nationalId: shipper.nationalId,
      vehicleNumber: shipper.vehicleNumber,
      area: shipper.area,
    }));

    const columnOrder = [
      "name",
      "phone",
      "email",
      "nationalId",
      "vehicleNumber",
      "area",
    ];

    const columnMapping = {
      name: "Tên shipper",
      phone: "Số điện thoại",
      email: "Email",
      nationalId: "CMND/CCCD",
      vehicleNumber: "Biển số xe",
      area: "Khu vực giao hàng",
    };

    exportPDF(
      exportData,
      "Shipper",
      "DanhSachShipper.pdf",
      columnOrder,
      columnMapping
    );
  };

  useEffect(() => {
    fetchShippers();
  }, []);

  return (
    <div className="flex flex-col gap-8 text-gray-700">
      {/* Tiêu đề */}
      <div>
        <p className="font-bold text-2xl mb-6">QUẢN LÝ NHÂN SỰ</p>

        {/* Form nhập liệu */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Họ và tên</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Số điện thoại</label>
            <input
              type="tel"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Email</label>
            <input
              type="email"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Mật khẩu</label>
            <input
              type="password"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">CCCD</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Biển số xe</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Giấy phép lái xe</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Khu vực hoạt động</label>
            <input
              type="text"
              className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
        </div>

        {/* Nút tạo tài khoản */}
        <div className="flex justify-end mt-6">
          <button
            className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition"
            onClick={handleCreateShipper}
          >
            TẠO TÀI KHOẢN
          </button>
        </div>
      </div>

      {/* Danh sách */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-2xl mb-6">
            DANH SÁCH NHÂN VIÊN GIAO HÀNG
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all"
            >
              Xuất Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all"
            >
              Xuất PDF
            </button>
          </div>
        </div>

        {/* Header table */}
        <div className="hidden md:grid grid-cols-6 gap-2 py-2 px-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded">
          <div>Họ tên</div>
          <div>SĐT</div>
          <div>CCCD</div>
          <div>Biển số xe</div>
          <div>Khu vực</div>
          <div>Thao tác</div>
        </div>

        {/* List rows */}
        {list.map((shipper) => (
          <div
            key={shipper._id}
            className="grid grid-cols-2 md:grid-cols-6 gap-2 py-2 px-3 border-b text-sm items-center"
          >
            <p>{shipper.name}</p>
            <p>{shipper.phone}</p>
            <p>{shipper.nationalId}</p>
            <p>{shipper.vehicleNumber}</p>
            <p>{shipper.area}</p>
            <button
              className="text-red-600 hover:text-red-800 transition"
              onClick={() => handleDeleteShipper(shipper._id)}
              title="Xóa shipper"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Employee;
