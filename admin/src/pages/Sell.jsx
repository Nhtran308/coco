import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Sell = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("admin-sell-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cash, setCash] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(backendUrl + "/api/product/list");
        if (res.data.success) {
          setProducts(res.data.products);
        } else {
          toast.error("Lỗi khi tải sản phẩm: " + res.data.message);
        }
      } catch (err) {
        toast.error("Lỗi server khi tải sản phẩm!");
      }
    };

    fetchProducts();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const getStock = () => {
    return selectedProduct?.totalStock || 0;
  };

  const handleAddToCart = () => {
    const stock = getStock();

    if (!selectedProduct || !selectedSize || !selectedColor || quantity < 1) {
      toast.warning("Vui lòng chọn đủ thông tin");
      return;
    }

    if (quantity > stock) {
      toast.warning(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }

    const key = `${selectedProductId}_${selectedSize}_${selectedColor}`;
    const exist = cart.find((item) => item.key === key);

    if (exist) {
      if (exist.quantity + quantity > stock) {
        toast.warning(`Tổng số lượng vượt quá tồn kho (${stock})`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.key === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          key,
          _id: selectedProduct._id,
          name: selectedProduct.name,
          size: selectedSize,
          color: selectedColor,
          quantity,
          price: selectedProduct.price,
          image: selectedProduct.image[0],
          stock,
        },
      ]);
    }

    setSelectedProductId("");
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    toast.success("Đã thêm vào giỏ hàng");
  };

  const removeItem = (key) => {
    setCart(cart.filter((item) => item.key !== key));
    toast.info("Đã xoá sản phẩm");
  };

  const updateQty = (key, qty) => {
    setCart(
      cart.map((item) => {
        if (item.key === key) {
          if (qty > item.stock) {
            toast.warning(`Tồn kho chỉ còn ${item.stock}`);
            return item;
          }
          return { ...item, quantity: Math.max(1, qty) };
        }
        return item;
      })
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    localStorage.setItem("admin-sell-cart", JSON.stringify(cart));
  }, [cart]);

  const placeOrder = async () => {
    try {
      const res = await axios.post(
        backendUrl + "/api/order/place",
        {
          userId: "admin",
          items: cart,
          amount: total,
          address: {
            type: "Tại cửa hàng",
            detail: "Thanh toán trực tiếp",
            fullName: "Coco",
            email: "coco_admin@gmail.com",
            phone: "0868298374",
            houseNumber: "85/2 Nguyễn Sơn",
            ward: "Phú Thạnh",
            district: "Tân Phú",
            province: "TP Hồ Chí Minh",
          },
          voucherCode: null,
          status: "Đã giao thành công",
          paymentMethod: "Offline",
          payment: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Đặt hàng thành công!");
        setCart([]);
        setCash(0);
        localStorage.removeItem("admin-sell-cart");
      } else {
        toast.error("Thất bại: " + res.data.message);
      }
    } catch (err) {
      toast.error("Lỗi kết nối tới server");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">BÁN HÀNG</h1>

      <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center mb-6">
        <select
          className="border px-2 py-2 rounded"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          className="border px-2 py-2 rounded"
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          disabled={!selectedProduct}
        >
          <option value="">-- Size --</option>
          {selectedProduct?.sizes?.map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>

        <select
          className="border px-2 py-2 rounded"
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          disabled={!selectedProduct}
        >
          <option value="">-- Màu --</option>
          {selectedProduct?.colors?.map((color) => (
            <option key={color}>{color}</option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max={getStock() || 1}
          value={quantity}
          className="border px-2 py-2 rounded w-16 text-center"
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value > 0) {
              setQuantity(value);
            }
          }}
        />

        <button
          onClick={handleAddToCart}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Thêm
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Giỏ hàng</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Sản phẩm</th>
            <th>Size</th>
            <th>Màu</th>
            <th>SL</th>
            <th>Giá</th>
            <th>Xoá</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.key} className="text-center">
              <td>{item.name}</td>
              <td>{item.size}</td>
              <td>{item.color}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQty(item.key, parseInt(e.target.value) || 1)
                  }
                  className="w-14 border px-1 text-center"
                />
              </td>
              <td>{(item.price * item.quantity).toLocaleString()}₫</td>
              <td>
                <button
                  onClick={() => removeItem(item.key)}
                  className="text-red-600"
                >
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-lg font-bold">
          Tổng tiền: {total.toLocaleString()}₫
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="number"
            placeholder="Tiền khách đưa"
            value={cash}
            onChange={(e) => setCash(Number(e.target.value))}
            className="border px-3 py-2 rounded w-40"
          />
          <p className="font-medium">
            Thối lại:{" "}
            <span
              className={cash - total >= 0 ? "text-green-600" : "text-red-600"}
            >
              {cash >= total ? (cash - total).toLocaleString() : "Thiếu tiền"}₫
            </span>
          </p>

          <button
            onClick={() => {
              if (cash < total) {
                toast.error("Khách đưa chưa đủ tiền!");
                return;
              }
              placeOrder();
            }}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Hoàn thành
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sell;
