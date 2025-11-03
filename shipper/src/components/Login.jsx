import React, { useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + "/api/shipper/login", {
        email,
        password,
      });

      setLoading(false);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
        toast.success("Đăng nhập thành công!");
        navigate("/revenue");
      } else {
        toast.error(response.data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || "Đã xảy ra lỗi máy chủ!";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white text-gray-700 w-full max-w-md p-10 rounded-2xl shadow-xl transition-all duration-300"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-wide">
          SHIPPER
        </h2>

        {/* Email */}
        {/* Email */}
        <div className="flex items-center gap-3 mb-5 border-2 border-gray-300 rounded-2xl px-5 h-16 bg-white focus-within:border-indigo-500 transition-all">
          <FaEnvelope className="text-gray-500" size={22} />
          <input
            className="w-full h-8 bg-transparent outline-none text-[17px] placeholder-gray-400"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 mb-6 border-2 border-gray-300 rounded-2xl px-5 h-16 bg-white focus-within:border-indigo-500 transition-all">
          <FaLock className="text-gray-500" size={22} />
          <input
            className="w-full h-8 bg-transparent outline-none text-[17px] placeholder-gray-400"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-xl font-semibold text-white tracking-wide text-base transition-all duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 active:scale-95"
          }`}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </button>
      </form>
    </div>
  );
};

export default Login;
