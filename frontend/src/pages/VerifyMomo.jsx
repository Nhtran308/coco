import { useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const VerifyMomo = () => {
  const [searchParams] = useSearchParams();
  const { setCartItems, navigate } = useContext(ShopContext);

  useEffect(() => {
    const resultCode = searchParams.get("resultCode");
    const extraData = searchParams.get("extraData");
    if (resultCode === "0" && extraData) {
      setCartItems({});
      navigate("/orders");
    } else {
      navigate("/cart");
    }
  }, [searchParams, setCartItems, navigate]);

  return <div>Đang xác thực thanh toán...</div>;
};

export default VerifyMomo;
