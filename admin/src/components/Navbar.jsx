import { assets } from "../assets/assets";
import { FaSignOutAlt } from "react-icons/fa";
const Navbar = ({ setToken }) => {
  return (
    <header className="flex items-center justify-between px-[5%] py-4 bg-white shadow-sm">
      <img
        src={assets.head_logo_red}
        alt="Logo"
        className="w-40 sm:w-48 object-contain"
      />

      <button
        onClick={() => setToken("")}
        className="flex items-center gap-2 bg-[#2F4155] text-white px-4 py-2 rounded-full text-sm hover:bg-[#1e2d3a] transition-colors duration-200"
      >
        <FaSignOutAlt className="text-base" />
        <span className="hidden sm:inline">Đăng xuất</span>
      </button>
    </header>
  );
};

export default Navbar;
