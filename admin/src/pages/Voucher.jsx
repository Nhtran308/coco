import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../App";

const Voucher = ({ token }) => {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState(1);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Không tìm thấy token, vui lòng đăng nhập lại!");
      return;
    }

    if (!code || !discount || !expiryDate || !usageLimit) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (discount < 1 || discount > 100) {
      toast.error("Phần trăm giảm giá phải từ 1% đến 100%!");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/voucher/create`,
        { code, discount, expiryDate, usageLimit },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Tạo mã giảm giá thành công!");
        setCode("");
        setDiscount(0);
        setExpiryDate("");
        setUsageLimit(1);
      } else {
        toast.error(res.data.message || "Có lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast.error("Mã đã tồn tại!");
    }
  };

  return (
    <form
      onSubmit={handleCreate}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="font-bold text-2xl mb-8">THÊM MÃ GIẢM GIÁ</p>
      </div>

      <div className="w-full">
        <p className="mb-2 font-semibold">Mã giảm giá</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full max-w-[700px] px-3 py-2 border"
          type="text"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2 font-semibold">Phần trăm giảm giá (%)</p>
        <input
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full max-w-[700px] px-3 py-2 border"
          type="number"
          min="1"
          max="100"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2 font-semibold">Hạn sử dụng</p>
        <input
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="w-full max-w-[700px] px-3 py-2 border"
          type="date"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2 font-semibold">Giới hạn lượt sử dụng</p>
        <input
          value={usageLimit}
          onChange={(e) => setUsageLimit(e.target.value)}
          className="w-full max-w-[700px] px-3 py-2 border"
          type="number"
          min="1"
          required
        />
      </div>

      <button
        type="submit"
        className="w-28 py-3 mt-4 bg-black text-white font-semibold hover:bg-gray-800"
      >
        THÊM
      </button>
    </form>
  );
};

export default Voucher;
