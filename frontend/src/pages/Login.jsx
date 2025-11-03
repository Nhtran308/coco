import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email trước.");
      return;
    }
    try {
      const response = await axios.post(
        backendUrl + "/api/user/forgot-password",
        {
          email,
        }
      );
      if (response.data.success) {
        toast.success(
          response.data.message || "Vui lòng kiểm tra email của bạn!"
        );
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi gửi email khôi phục mật khẩu.");
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Kiểm tra input trống trước khi gọi API
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + "/api/user/register", {
          fullName,
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message || "Đăng ký thất bại.");
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
        } else {
          toast.error(response.data.message || "Đăng nhập thất bại.");
        }
      }
    } catch (error) {
      console.error(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);
  return (
    <div className="h-[480px] mt-20 flex items-center justify-center ">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white text-gray-600 max-w-[340px] w-full mx-4 md:p-6 p-4 py-8 text-left text-sm rounded-lg shadow-[0_0_10px_0] shadow-black/10"
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
          {currentState === "Login" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
        </h2>

        {currentState === "Sign Up" && (
          <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-2 pl-2">
            <FaUser className="text-gray-600 opacity-60" size={18} />
            <input
              className="w-full outline-none bg-transparent py-2.5"
              type="text"
              placeholder="Tên người dùng"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex items-center my-2 border bg-indigo-500/5 border-gray-500/10 rounded gap-2 pl-2">
          <FaEnvelope className="text-gray-600 opacity-60" size={18} />
          <input
            className="w-full outline-none bg-transparent py-2.5"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center mt-2 mb-6 border bg-indigo-500/5 border-gray-500/10 rounded gap-2 pl-2">
          <FaLock className="text-gray-600 opacity-60" size={18} />
          <input
            className="w-full outline-none bg-transparent py-2.5"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {currentState === "Login" && (
          <p
            className="text-sm mb-3 cursor-pointer hover:underline text-right"
            onClick={handleForgotPassword}
          >
            Quên mật khẩu?
          </p>
        )}

        <button className="w-full mb-3 bg-indigo-500 hover:bg-indigo-600 transition-all active:scale-95 py-2.5 rounded text-white font-medium">
          {currentState === "Login" ? "ĐĂNG NHẬP" : "TẠO TÀI KHOẢN"}
        </button>

        <p className="text-center mt-4">
          {currentState === "Login"
            ? "Bạn chưa có tài khoản?"
            : "Bạn đã có tài khoản?"}{" "}
          <span
            onClick={() =>
              setCurrentState(currentState === "Login" ? "Sign Up" : "Login")
            }
            className="text-blue-500 cursor-pointer underline"
          >
            {currentState === "Login" ? "Đăng ký" : "Đăng nhập"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
