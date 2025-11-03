import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
  } = useContext(ShopContext);
  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("isSubscribed");
    setToken("");
    setCartItems({});
  };
  return (
    <div className=" bg-rred  w-full flex items-center justify-between py-3 font-medium">
      <div className=" sm:px-[3vw] md:px-[3vw] lg:px-[3vw] flex items-center justify-between">
        <Link to="/">
          <img
            src={assets.head_logo_beige}
            className="w-40 ml-auto"
            alt="Logo"
          />
        </Link>
      </div>

      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink
          to="/"
          className="group text-md text-white flex flex-col items-center gap-1 ml-5"
        >
          <p>TRANG CHỦ</p>
          <hr className="w-2/4 h-[1.5px] bg-white opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-200" />
        </NavLink>
        <NavLink
          to="/collection"
          className="group text-md text-white flex flex-col items-center gap-1 ml-5"
        >
          <p>BỘ SƯU TẬP</p>
          <hr className="w-2/4 h-[1.5px] bg-white opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-200" />
        </NavLink>
        <NavLink
          to="/about"
          className="group text-md text-white flex flex-col items-center gap-1 ml-5"
        >
          <p>CHÚNG TÔI</p>
          <hr className="w-2/4 h-[1.5px] bg-white opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-200" />
        </NavLink>
        <NavLink
          to="/contact"
          className="group text-md text-white flex flex-col items-center gap-1 ml-5"
        >
          <p>LIÊN HỆ</p>
          <hr className="w-2/4 h-[1.5px] bg-white opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100 transition-all duration-200" />
        </NavLink>
      </ul>

      <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            <FaSearch
              onClick={() => setShowSearch(true)}
              className="w-5 h-5 cursor-pointer text-white"
            />
          </div>

          <div className="group relative">
            <div
              onClick={() => {
                token ? null : navigate("/login");
              }}
              className="w-5 h-5 text-white cursor-pointer"
            >
              <FaUser className="w-5 h-5" />
            </div>

            {token && (
              <div className="group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50">
                <div className="w-40 py-3 px-4 bg-white rounded-xl shadow-lg text-gray-600 flex flex-col gap-2 transition-all duration-200">
                  {/* Tài khoản */}
                  <div
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#567C8D] hover:bg-slate-100 rounded px-2 py-1 transition"
                  >
                    <FaUser size={16} />
                    <span>Tài khoản</span>
                  </div>

                  {/* Đơn hàng */}
                  <div
                    onClick={() => navigate("/orders")}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#567C8D] hover:bg-slate-100 rounded px-2 py-1 transition"
                  >
                    <FaClipboardList size={16} />
                    <span>Đơn hàng</span>
                  </div>

                  {/* Đăng xuất */}
                  <div
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#567C8D] hover:bg-slate-100 rounded px-2 py-1 transition"
                  >
                    <FaSignOutAlt size={16} />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            {/* Giỏ hàng */}
            <Link to="/cart" className="relative">
              <FaShoppingCart className="w-6 h-6 text-white" />
              <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {getCartCount()}
              </p>
            </Link>
          </div>

          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-5 cursor-pointer sm:hidden"
            alt="Menu"
          />
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 bg-white overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          visible ? "w-3/4 shadow-lg" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-700 font-medium">
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-100"
          >
            <img
              src={assets.dropdown_icon}
              className="h-4 rotate-180"
              alt="Back"
            />
            <p>Quay lại</p>
          </div>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border-b hover:bg-gray-100"
            to="/"
          >
            Trang chủ
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border-b hover:bg-gray-100"
            to="/collection"
          >
            Bộ sưu tập
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border-b hover:bg-gray-100"
            to="/about"
          >
            Chúng tôi
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-3 pl-6 border-b hover:bg-gray-100"
            to="/contact"
          >
            Liên hệ
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
