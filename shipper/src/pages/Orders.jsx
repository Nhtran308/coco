import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { FaBox } from "react-icons/fa";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState({});

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + "/api/order/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const sortedOrders = response.data.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const incrementOrderCount = async () => {
    try {
      await axios.put(`${backendUrl}/api/shipper/increment`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Tăng đơn hàng lỗi:", error);
    }
  };

  const decrementOrderCount = async () => {
    try {
      await axios.put(`${backendUrl}/api/shipper/decrement`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Giảm đơn hàng lỗi:", error);
    }
  };

  const updateStatus = async (orderId, status, reason = null) => {
    setLoading(true);
    try {
      const response = await axios.post(
        backendUrl + "/api/shipper/update-status",
        {
          orderId,
          status,
          cancelReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Gọi API tăng/giảm currentOrders tùy theo trạng thái
        if (status === "Đang giao hàng") {
          await incrementOrderCount();
        } else if (
          status === "Đã giao thành công" ||
          status === "Giao không thành công"
        ) {
          await decrementOrderCount();
        }

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

  useEffect(() => {
    const assignIfNeeded = async () => {
      if (!token) return;
      setLoading(true);
      try {
        await axios.post(
          `${backendUrl}/api/order/assign`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const response = await axios.get(`${backendUrl}/api/order/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const sortedOrders = response.data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Lỗi: " + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    assignIfNeeded();
  }, [token]);

  const cancelReasons = [
    "Khách không nhận hàng",
    "Hàng không đúng",
    "Sai địa chỉ",
    "Lý do khác",
  ];

  return (
    <div>
      <p className="mb-2 font-bold text-2xl mb-8">DANH SÁCH ĐƠN HÀNG</p>
      {loading && <div className="text-center">Đang tải...</div>}
      <div>
        {orders.map((order) => (
          <div
            className={`grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700 rounded-xl ${
              order.status === "Yêu cầu hoàn hàng" ? "bg-yellow-50" : ""
            }`}
            key={order._id}
          >
            <div className="flex items-center justify-start h-full">
              <FaBox className="w-6 h-6 text-gray-700" />
            </div>

            <div>
              <div>
                {order.items.map((item) => (
                  <p className="py-0.5" key={item._id}>
                    {item.name} x {item.quantity} <span>{item.size}</span>
                    <span>{order.colors ? order.colors.join(", ") : ""}</span>
                  </p>
                ))}
              </div>
              <p className="mt-3 mb-2 font-medium">
                Khách hàng: {order.address.fullName}
              </p>
              <div>
                <p>
                  Địa chỉ:{" "}
                  {`${order.address.houseNumber}, ${order.address.ward}, ${order.address.district}, ${order.address.province}`}
                </p>
              </div>
              <p>Số điện thoại: {order.address.phone}</p>
            </div>

            <div>
              <p className="text-sm sm:text-[15px]">
                Số lượng: {order.items.length}
              </p>
              <p className="mt-3">Thanh toán: {order.paymentMethod}</p>
              <p>Tình trạng: {order.payment ? "Thành công" : "Chờ"}</p>
              <p>Thời gian: {new Date(order.date).toLocaleDateString()}</p>
            </div>

            <p className="text-sm sm:text-[15px]">
              {order.amount.toLocaleString("vi-VN")} {currency}
            </p>

            <div className="flex flex-col gap-2">
              {order.status !== "Đã giao thành công" &&
                order.status !== "Giao không thành công" && (
                  <>
                    {order.status !== "Đang giao hàng" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "Đang giao hàng")
                        }
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        NHẬN ĐƠN
                      </button>
                    )}

                    {order.status === "Đang giao hàng" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(order._id, "Đã giao thành công")
                          }
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          HOÀN THÀNH
                        </button>
                        <button
                          onClick={() =>
                            setCancelReason((prev) => ({
                              ...prev,
                              [order._id]: "",
                            }))
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          HỦY
                        </button>
                      </>
                    )}
                  </>
                )}

              {order.status === "Đang giao hàng" &&
                cancelReason.hasOwnProperty(order._id) && (
                  <div className="mt-2">
                    <select
                      className="w-full p-2 border rounded"
                      onChange={(e) =>
                        setCancelReason((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      value={cancelReason[order._id] || ""}
                    >
                      <option value="">-- Chọn lý do --</option>
                      {cancelReasons.map((reason, idx) => (
                        <option key={idx} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() =>
                        updateStatus(
                          order._id,
                          "Giao không thành công",
                          cancelReason[order._id]
                        )
                      }
                      disabled={!cancelReason[order._id]}
                      className="mt-2 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      Xác nhận hủy
                    </button>
                  </div>
                )}

              {/* Lý do hủy nếu đơn đã bị hủy */}
              {order.status === "Giao không thành công" &&
                order.cancelReason && (
                  <div className="mt-2 text-sm text-gray-500">
                    <strong>Lý do hủy đơn:</strong> {order.cancelReason}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
