import React from "react";
import { NavLink } from "react-router-dom";
import { FaMoneyBillAlt, FaBoxes, FaRegUserCircle } from "react-icons/fa";
import { assets } from "../assets/assets";

const Sidebar = () => {
  return (
    <div className="w-[18%] min-h-screen border-r bg-white shadow-md">
      <div className="flex flex-col gap-2 pt-8 px-6 text-[15px] font-medium text-gray-700">
        {[
          {
            to: "/revenue",
            icon: <FaMoneyBillAlt className="w-5 h-5" />,
            label: "THU NHẬP",
          },
          {
            to: "/orders",
            icon: <FaBoxes className="w-5 h-5" />,
            label: "ĐƠN HÀNG",
          },
          {
            to: "/profile",
            icon: <FaRegUserCircle className="w-5 h-5" />,
            label: "HỒ SƠ CÁ NHÂN",
          },
        ].map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
            ${
              isActive
                ? "bg-[#567C8D] text-white shadow-md"
                : "hover:bg-gray-100"
            }`
            }
          >
            {item.icon}
            <p className="hidden md:block">{item.label}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
