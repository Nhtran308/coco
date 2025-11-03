import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { exportToExcel } from "../utils/exportToExcel";

import exportPDF from "../utils/exportToPDF";
const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/list",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const sortedOrders = response.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId,
          status: event.target.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        await fetchAllOrders();
        toast.success("Cập nhật trạng thái thành công!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = orders.map((order) => ({
      "Khách hàng": order.address.fullName,
      "Số điện thoại": order.address.phone,
      "Địa chỉ": `${order.address.houseNumber}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`,
      "Sản phẩm": order.items
        .map((item) => `${item.name} x${item.quantity} (${item.size})`)
        .join(", "),
      "Phương thức thanh toán": order.paymentMethod,
      "Tình trạng thanh toán": order.payment ? "Thành công" : "Chờ",
      "Tình trạng đơn hàng": order.status,
      "Tổng tiền": order.amount.toLocaleString("vi-VN"),
      "Thời gian đặt": new Date(order.date).toLocaleDateString("vi-VN"),
    }));

    exportToExcel(exportData, "DanhSachDonHang.xlsx", "Đơn hàng");
  };

  const handleExportPDF = () => {
    const exportData = orders.map((order) => ({
      fullName: order.address.fullName,
      phone: order.address.phone,
      address: `${order.address.houseNumber}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`,
      items: order.items
        .map((item) => `${item.name} x${item.quantity} (${item.size})`)
        .join(", "),
      paymentMethod: order.paymentMethod,
      paymentStatus: order.payment ? "Thành công" : "Chờ",
      orderStatus: order.status,
      amount: order.amount.toLocaleString("vi-VN") + "₫",
      date: new Date(order.date).toLocaleDateString("vi-VN"),
    }));

    const columnOrder = [
      "fullName",
      "phone",
      "address",
      "items",
      "paymentMethod",
      "paymentStatus",
      "orderStatus",
      "amount",
      "date",
    ];

    const columnMapping = {
      fullName: "Khách hàng",
      phone: "Số điện thoại",
      address: "Địa chỉ",
      items: "Sản phẩm",
      paymentMethod: "Phương thức thanh toán",
      paymentStatus: "Tình trạng thanh toán",
      orderStatus: "Tình trạng đơn hàng",
      amount: "Tổng tiền",
      date: "Thời gian đặt",
    };

    exportPDF(
      exportData,
      "Đơn hàng",
      "DanhSachDonHang.pdf",
      columnOrder,
      columnMapping
    );
  };

  useEffect(() => {
    console.log("TOKEN ADMIN:", token);
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="font-bold text-2xl mb-6">DANH SÁCH ĐƠN HÀNG</p>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="text-sm px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-all"
          >
            Xuất Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
          >
            Xuất PDF
          </button>
        </div>
      </div>

      {loading && <div className="text-center text-gray-500">Đang tải...</div>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className={`w-full bg-white rounded-xl shadow-md p-6 border transition-all duration-200 ${
              order.status === "Yêu cầu hủy đơn" ||
              order.status === "Giao không thành công"
                ? "border-red-300 bg-red-50"
                : order.status === "Đã giao thành công"
                ? "border-green-300 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 text-sm text-gray-700">
              {/* Cột 1: Hình ảnh và thông tin sản phẩm */}
              <div className="flex items-start gap-4 col-span-2">
                {/* Hình ảnh sản phẩm đầu tiên */}
                <img
                  src={
                    Array.isArray(order.items[0]?.image)
                      ? order.items[0].image[0]
                      : order.items[0]?.image
                  }
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <p key={item._id} className="leading-relaxed">
                      <span className="font-medium">{item.name}</span> x{" "}
                      {item.quantity}
                      {item.size && <span> - Size: {item.size}</span>}
                    </p>
                  ))}
                  <p className="mt-3 text-gray-800 font-semibold">
                    Khách hàng: {order.address.fullName}
                  </p>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    <p>
                      {order.address.houseNumber}, {order.address.ward},<br />
                      {order.address.district}, {order.address.province}
                    </p>
                    <p>
                      SĐT:{" "}
                      <span className="font-medium">{order.address.phone}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Cột 2: Thông tin đơn hàng */}
              <div className="space-y-2">
                <p>Số lượng sản phẩm: {order.items.length}</p>
                <p>
                  Thanh toán:{" "}
                  <span className="font-medium">{order.paymentMethod}</span>
                </p>
                <p>
                  Tình trạng thanh toán:{" "}
                  <span
                    className={
                      order.payment
                        ? "text-green-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {order.payment ? "Thành công" : "Chờ"}
                  </span>
                </p>
                <p>Ngày đặt: {new Date(order.date).toLocaleDateString()}</p>
              </div>

              {/* Cột 3: Tổng tiền và trạng thái */}
              <div className="space-y-3">
                <p className="text-lg font-semibold text-gray-900">
                  {order.amount.toLocaleString("vi-VN")} {currency}
                </p>
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.status}
                  className="w-full p-2 rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Đã đặt hàng">Đã đặt hàng</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đang giao hàng">Đang giao hàng</option>
                  <option value="Đã giao thành công">Đã giao thành công</option>
                  <option value="Đã hoàn hàng">Đã hoàn hàng</option>
                  <option value="Hủy đơn thành công">Hủy đơn thành công</option>
                  <option value="Hủy đơn không thành công">
                    Hủy đơn không thành công
                  </option>
                  <option value="Yêu cầu hủy đơn">Yêu cầu hủy đơn</option>
                  <option value="Yêu cầu hoàn hàng">Yêu cầu hoàn hàng</option>
                  <option value="Giao không thành công">
                    Giao không thành công
                  </option>
                </select>

                {(order.status === "Yêu cầu hủy đơn" ||
                  (order.status === "Giao không thành công" &&
                    order.cancelReason)) && (
                  <p className="text-sm text-gray-500">
                    <strong>Lý do hủy đơn:</strong> {order.cancelReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
