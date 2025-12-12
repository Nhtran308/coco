import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "VND";
  const delivery_fee = "50000";
  const backendUrl = "https://coco-backend-ywp8.onrender.com";
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // Add product to the cart
  const addToCart = async (itemId, size, color, price, image) => {
    if (isAdding) return;

    setIsAdding(true);

    if (!size || !color) {
      toast.error("Bạn chưa chọn kích thước hoặc màu sắc");
      return;
    }

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size, color, price, image },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.data.success) {
          toast.error(response.data.message || "Không thể thêm vào giỏ hàng");
          return;
        }

        let cartData = structuredClone(cartItems);
        const sizeColorKey = `${size}-${color}`;

        if (cartData[itemId]) {
          if (cartData[itemId][sizeColorKey]) {
            cartData[itemId][sizeColorKey].quantity += 1;
          } else {
            cartData[itemId][sizeColorKey] = { quantity: 1, price, image };
          }
        } else {
          cartData[itemId] = { [sizeColorKey]: { quantity: 1, price, image } };
        }

        setCartItems(cartData);
        toast.success("Đã thêm vào giỏ hàng");
        setTimeout(() => setIsAdding(false), 500);
      } catch (error) {
        console.log(error);
        toast.error("Lỗi khi thêm sản phẩm vào giỏ hàng");
      }
    } else {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ");
    }
  };

  const removeFromCart = async (itemId, size, color) => {
    let cartData = structuredClone(cartItems);
    const sizeColorKey = `${size}-${color}`;

    if (cartData[itemId] && cartData[itemId][sizeColorKey]) {
      delete cartData[itemId][sizeColorKey];

      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/remove",
          { itemId, size, color },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const updateQuantity = async (itemId, size, color, quantity) => {
    const sizeColorKey = `${size}-${color}`;

    if (!token) {
      toast.error("Bạn cần đăng nhập để cập nhật giỏ hàng");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/cart/update",
        { itemId, size, color, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        toast.error(response.data.message || "Cập nhật không thành công");
        return;
      }

      let cartData = structuredClone(cartItems);

      if (!cartData[itemId]) {
        toast.error("Sản phẩm không tồn tại trong giỏ hàng");
        return;
      }

      if (!cartData[itemId][sizeColorKey]) {
        toast.error("Biến thể sản phẩm không tồn tại");
        return;
      }

      cartData[itemId][sizeColorKey] = {
        ...cartData[itemId][sizeColorKey],
        quantity: quantity,
      };

      setCartItems(cartData);
    } catch (error) {
      console.log(error);
      toast.error("Lỗi khi cập nhật số lượng");
    }
  };

  const getCartCount = () => {
    let totalCount = 0;

    for (const itemId in cartItems) {
      for (const sizeColorKey in cartItems[itemId]) {
        const cartItem = cartItems[itemId][sizeColorKey];

        if (cartItem && cartItem.quantity > 0) {
          totalCount += cartItem.quantity;
        }
      }
    }

    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        for (const sizeColorKey in cartItems[itemId]) {
          const cartItem = cartItems[itemId][sizeColorKey];
          if (cartItem.quantity > 0) {
            totalAmount += product.price * cartItem.quantity;
          }
        }
      }
    }

    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {}
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        console.log("Received cartData:", response.data.cartData);
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {}
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!token && savedToken) {
      setToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  useEffect(() => {
    if (cartItems && token) {
      const updateCartData = async () => {
        try {
          await axios.post(
            backendUrl + "/api/cart/update",
            { cartItems },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log("Giỏ hàng đã được cập nhật trên backend.");
        } catch (error) {
          console.log("Lỗi khi cập nhật giỏ hàng:", error);
        }
      };
      updateCartData();
    }
  }, [cartItems, token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    token,
    setToken,
    removeFromCart,
    discount,
    setDiscount,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
