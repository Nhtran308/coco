import React, { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { ShopContext } from "../../context/ShopContext";
import { CartSummary, Title } from "../../components/user";
import { assets } from "../../assets/assets";

const PlaceOrder = () => {
  const voucherCode = localStorage.getItem("voucherCode");
  const [method, setMethod] = useState("COD");
  const [receiverType, setReceiverType] = useState("me");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    discount,
    setDiscount,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    houseNumber: "",
    ward: "",
    district: "",
    province: "",
  });
  const [originalData, setOriginalData] = useState(formData);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item].quantity > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item].quantity;
              orderItems.push(itemInfo);
            }
          }
        }
      }
      const deliveryFee =
        Number(getCartAmount()) >= 1000000 ? 0 : Number(delivery_fee);
      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + deliveryFee - discount,
        voucherCode: voucherCode || null,
      };

      if (method === "COD") {
        const response = await axios.post(
          `${backendUrl}/api/order/place`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setCartItems({});
          setDiscount(0);
          localStorage.removeItem("voucherCode");
          navigate("/success");
        } else {
          toast.error(response.data.message);
        }
      } else if (method === "stripe") {
        const responseStripe = await axios.post(
          `${backendUrl}/api/order/stripe`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (responseStripe.data.success) {
          localStorage.removeItem("voucherCode");
          const { session_url } = responseStripe.data;
          window.location.replace(session_url);
        } else {
          toast.error(responseStripe.data.message);
        }
      } else if (method === "momo") {
        const responseMomo = await axios.post(
          `${backendUrl}/api/order/momo`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (responseMomo.data.success) {
          localStorage.removeItem("voucherCode");
          const { payUrl } = responseMomo.data;
          window.location.replace(payUrl);
        } else {
          toast.error(responseMomo.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng"
      );
    }
  };

  useEffect(() => {
    if (receiverType === "other") {
      setOriginalData(formData);
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        houseNumber: "",
        province: "",
        district: "",
        ward: "",
      });
    } else {
      setFormData(originalData);
    }
  }, [receiverType]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/user/profile`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("User profile response:", response.data);

        if (response.data && response.data.success && response.data.user) {
          const user = response.data.user;
          setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.address?.phone || "",
            houseNumber: user.address?.houseNumber || "",
            ward: user.address?.ward || "",
            district: user.address?.district || "",
            province: user.address?.province || "",
          });
        } else {
          console.log("Lỗi dữ liệu:", response.data);
        }
      } catch (error) {
        console.error("Lỗi request:", error);
      }
    };

    fetchUserInfo();
  }, [backendUrl, token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-6 sm:max-w-[480px] h-full bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800">
          <Title text1="THÔNG TIN" text2="GIAO HÀNG" />
        </h2>

        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="fullName"
            value={formData.fullName}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Họ và tên"
            required
          />
          <input
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Số điện thoại"
            required
          />
        </div>

        <input
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="email"
          placeholder="Email"
          required
        />

        <input
          onChange={onChangeHandler}
          name="houseNumber"
          value={formData.houseNumber}
          className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="text"
          placeholder="Địa chỉ (số nhà, đường)"
          required
        />

        <div className="flex gap-3">
          <input
            onChange={onChangeHandler}
            name="province"
            value={formData.province}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Thành phố"
            required
          />
          <input
            onChange={onChangeHandler}
            name="district"
            value={formData.district}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Quận/Huyện"
            required
          />
          <input
            onChange={onChangeHandler}
            name="ward"
            value={formData.ward}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Phường/Xã"
            required
          />
        </div>

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <span
              className={`w-4 h-4 rounded-full border-2 ${
                receiverType === "me"
                  ? "bg-rred border-rred"
                  : "border-gray-400"
              }`}
            />
            <span className="text-sm text-gray-800">ĐỊA CHỈ CỦA TÔI</span>
            <input
              type="radio"
              name="receiverType"
              value="me"
              checked={receiverType === "me"}
              onChange={() => setReceiverType("me")}
              className="hidden"
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <span
              className={`w-4 h-4 rounded-full border-2 ${
                receiverType === "other"
                  ? "bg-rred border-rred"
                  : "border-gray-400"
              }`}
            />
            <span className="text-sm text-gray-800">NGƯỜI NHẬN KHÁC</span>
            <input
              type="radio"
              name="receiverType"
              value="other"
              checked={receiverType === "other"}
              onChange={() => setReceiverType("other")}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        <div className="mt-4">
          <CartSummary />
        </div>

        <div className="mt-8">
          <Title text1="PHƯƠNG THỨC" text2="THANH TOÁN" />

          <div className="flex flex-col gap-4 lg:flex-row mt-4">
            {/* Stripe */}
            <div
              onClick={() => setMethod("stripe")}
              className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition hover:shadow-sm ${
                method === "stripe" ? "border-green-400 bg-green-50" : ""
              }`}
            >
              <div
                className={`w-4 h-4 border rounded-full flex-shrink-0 ${
                  method === "stripe" ? "bg-green-400" : ""
                }`}
              />
              <img className="h-5 mx-2" src={assets.stripe_logo} alt="stripe" />
            </div>

            {/* Momo */}
            <div
              onClick={() => setMethod("momo")}
              className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition hover:shadow-sm ${
                method === "momo" ? "border-green-400 bg-green-50" : ""
              }`}
            >
              <div
                className={`w-4 h-4 border rounded-full flex-shrink-0 ${
                  method === "momo" ? "bg-green-400" : ""
                }`}
              />
              <img className="h-6 mx-2" src={assets.momo_logo} alt="momo" />
            </div>

            {/* COD */}
            <div
              onClick={() => setMethod("COD")}
              className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition hover:shadow-sm ${
                method === "COD" ? "border-green-400 bg-green-50" : ""
              }`}
            >
              <div
                className={`w-4 h-4 border rounded-full flex-shrink-0 ${
                  method === "COD" ? "bg-green-400" : ""
                }`}
              />
              <p className="text-gray-600 text-sm font-medium mx-2">
                THANH TOÁN KHI NHẬN HÀNG
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-6">
            <button
              type="submit"
              className="bg-black text-white px-10 py-2.5 text-sm rounded-lg hover:bg-gray-800 transition"
            >
              ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
