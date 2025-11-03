import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[500px] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-500 text-5xl" />
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được tiếp nhận và sẽ được
          xử lý sớm.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/collection")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition duration-200"
          >
            Mua tiếp
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition duration-200"
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
