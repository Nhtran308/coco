import React from "react";
import { assets } from "../assets/assets";

const OurPolicy = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 px-6 py-16 bg-white text-center text-gray-700">
      {[
        {
          icon: assets.shipping_icon,
          title: "VẬN CHUYỂN SIÊU TỐC",
          subtitle: "ngay trong nội thành HCM",
        },
        {
          icon: assets.exchange_alt,
          title: "MIỄN PHÍ ĐỔI TRẢ",
          subtitle: "trong vòng 3 ngày sau khi nhận hàng",
        },
        {
          icon: assets.phone_icon,
          title: "TƯ VẤN - HỖ TRỢ",
          subtitle: "9:00 - 21:30 hằng ngày",
        },
      ].map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-6 rounded-xl transition duration-300 ease-in-out hover:scale-[1.01] "
        >
          <img src={item.icon} className="w-12 mb-4" alt="" />
          <p className="font-semibold text-base text-gray-800">{item.title}</p>
          <p className="text-gray-500 text-sm mt-1">{item.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default OurPolicy;
