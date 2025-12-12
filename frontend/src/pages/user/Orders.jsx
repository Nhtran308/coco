import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import { Title } from "../../components/user";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [openOrderId, setOpenOrderId] = useState(null);
  const [returnOrderId, setReturnOrderId] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/user-orders",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        let allOrderData = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            const [size, color] = item.size?.split("-") || ["", ""];

            item["size"] = size;
            item["color"] = color;
            item["amount"] = order.amount;
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["orderId"] = order._id;
            item["returned"] = order.returned;

            allOrderData.push(item);
          });
        });
        setOrderData(allOrderData.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancelOrderId(orderId);
  };

  const handleReturnOrder = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId,
          status: "Yêu cầu hoàn hàng",
          returned: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadOrderData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) {
      setReasonError("Vui lòng chọn lý do hủy đơn");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId: cancelOrderId,
          status: "Yêu cầu hủy đơn",
          cancelReason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadOrderData();
        setCancelOrderId(null);
        setCancelReason("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelCancel = () => {
    setCancelOrderId(null);
    setCancelReason("");
    setReasonError("");
  };

  const handleCancelRequest = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId,
          status: "Đã đặt hàng",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadOrderData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReturnRequestCancel = async (orderId) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/status",
        {
          orderId,
          returned: false,
          status: "Đã giao thành công",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadOrderData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const groupedOrders = orderData.reduce((acc, item) => {
    if (!acc[item.orderId]) {
      acc[item.orderId] = {
        ...item,
        items: [item],
      };
    } else {
      acc[item.orderId].items.push(item);
    }
    return acc;
  }, {});

  const toggleOrder = (orderId) => {
    setOpenOrderId(openOrderId === orderId ? null : orderId);
  };

  useEffect(() => {
    if (token) {
      loadOrderData();
    }
  }, [token]);

  return (
    <div className="border-t pt-16  min-h-screen px-2 sm:px-4">
      <div className="text-2xl mb-8 font-semibold text-center text-gray-800">
        <Title text1="ĐƠN" text2="HÀNG" />
      </div>

      <div className="space-y-6">
        {Object.values(groupedOrders).map((order, index) => {
          const isOpen = openOrderId === order.orderId;
          const total = order.items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          return (
            <div
              key={index}
              className="bg-white border rounded-lg shadow hover:shadow-md transition-all duration-300"
            >
              {/* Dòng chính */}
              <div
                onClick={() => toggleOrder(order.orderId)}
                className="flex justify-between items-center p-4 cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    Mã đơn: {order.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày: {new Date(order.date).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái: {order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-800 font-medium">
                    Tổng: {order.amount.toLocaleString("vi-VN")} {currency}
                  </p>
                  <p className="text-sm text-blue-500">
                    {isOpen ? "Ẩn chi tiết ▲" : "Xem chi tiết ▼"}
                  </p>
                </div>
              </div>

              {/* Chi tiết */}
              {isOpen && (
                <div className="bg-gray-50 border-t px-4 py-4 space-y-4 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <Link to={`/product/${item._id}`} className="block">
                        <img
                          src={item.image[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded hover:opacity-90 transition"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/product/${item._id}`}
                          className="font-medium text-gray-800 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <p className="text-gray-600">
                          SL: {item.quantity} | Size: {item.size} | Màu:{" "}
                          {item.color}
                        </p>
                        <p className="text-gray-700">
                          {item.price.toLocaleString("vi-VN")} {currency}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Nút thao tác */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {/* Nút Kiểm tra */}
                    {![
                      "Yêu cầu hủy đơn",
                      "Hủy đơn thành công",
                      "Giao không thành công",
                    ].includes(order.status) && (
                      <button
                        onClick={loadOrderData}
                        className="px-4 py-1 text-sm rounded border border-gray-400 text-gray-700 hover:bg-gray-100"
                      >
                        Kiểm tra
                      </button>
                    )}

                    {/* Nút Hủy yêu cầu hủy đơn */}
                    {order.status === "Yêu cầu hủy đơn" && (
                      <button
                        onClick={() => handleCancelRequest(order.orderId)}
                        className="px-4 py-1 text-sm rounded border border-red-500 text-red-500 hover:bg-red-50"
                      >
                        Hủy yêu cầu
                      </button>
                    )}

                    {/* Nút Hủy đơn */}
                    {![
                      "Đã giao thành công",
                      "Hủy đơn thành công",
                      "Giao không thành công",
                      "Hủy đơn không thành công",
                      "Yêu cầu hủy đơn",
                      "Yêu cầu hoàn hàng",
                    ].includes(order.status) &&
                      (() => {
                        const createdAt = new Date(order.date);
                        const now = new Date();
                        const diffInDays =
                          (now - createdAt) / (1000 * 60 * 60 * 24);

                        if (diffInDays <= 1) {
                          return (
                            <button
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="px-4 py-1 text-sm rounded border border-red-500 text-red-500 hover:bg-red-50"
                            >
                              Hủy đơn
                            </button>
                          );
                        } else {
                          return (
                            <span className="italic text-gray-400 px-2 py-1 text-sm">
                              Đã quá thời hạn hủy đơn
                            </span>
                          );
                        }
                      })()}

                    {order.status === "Yêu cầu hoàn hàng" ? (
                      <button
                        onClick={() => handleReturnRequestCancel(order.orderId)}
                        className="px-4 py-1 text-sm rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                      >
                        Hủy yêu cầu hoàn hàng
                      </button>
                    ) : (
                      order.status === "Đã giao thành công" &&
                      order.returned === false &&
                      (() => {
                        console.log("Status:", order.status);
                        console.log(
                          "Returned:",
                          order.returned,
                          typeof order.returned
                        );

                        if (order.status !== "Đã giao thành công") {
                          return (
                            <p className="text-red-500">
                              Không phải đơn đã giao
                            </p>
                          );
                        }

                        if (order.returned != false) {
                          return (
                            <p className="text-red-500">
                              Đơn đã hoàn hàng hoặc sai kiểu dữ liệu
                            </p>
                          );
                        }
                        const deliveredAt = new Date(order.date);
                        const now = new Date();
                        const diffInDays =
                          (now - deliveredAt) / (1000 * 60 * 60 * 24);

                        if (diffInDays <= 7) {
                          return (
                            <button
                              onClick={() => handleReturnOrder(order.orderId)}
                              className="px-4 py-1 text-sm rounded border border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                            >
                              Hoàn hàng
                            </button>
                          );
                        } else {
                          return (
                            <span className="italic text-gray-400 px-2 py-1 text-sm">
                              Đã quá thời hạn hoàn hàng
                            </span>
                          );
                        }
                      })()
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal lý do hủy đơn */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Chọn lý do hủy đơn
            </h3>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Chọn lý do</option>
              <option value="Đặt nhầm sản phẩm">Đặt nhầm sản phẩm</option>
              <option value="Sai thông tin địa chỉ">
                Sai thông tin địa chỉ
              </option>
              <option value="Đơn trùng">Đơn trùng</option>
              <option value="Lý do khác">Lý do khác</option>
            </select>
            {reasonError && (
              <p className="text-red-500 text-sm mb-4">{reasonError}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelCancel}
                className="px-4 py-2 border rounded text-gray-500 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 border rounded text-white bg-red-500 hover:bg-red-600"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
