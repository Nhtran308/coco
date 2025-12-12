import { useContext, useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/ShopContext";
import { CartSummary, Title } from "../../components/user";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    removeFromCart,
    getCartCount,
  } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      for (const itemId in cartItems) {
        for (const sizeColorKey in cartItems[itemId]) {
          const cartItem = cartItems[itemId][sizeColorKey];
          const [size, color] = sizeColorKey.split("-");
          const product = products.find((p) => p._id === itemId);

          if (!product) continue;

          const stock =
            product.variations?.[sizeColorKey]?.stock || product.totalStock;

          if (cartItem.quantity > 0) {
            let adjustedQuantity = cartItem.quantity;

            if (stock < cartItem.quantity) {
              adjustedQuantity = stock;
              updateQuantity(itemId, size, color, adjustedQuantity);
              toast.warning(
                `Số lượng sản phẩm ${product.name} (${size}, ${color}) đã được giảm về ${stock} do tồn kho thay đổi.`
              );
            }

            tempData.push({
              _id: itemId,
              size,
              color,
              quantity: adjustedQuantity,
              price: product.price,
              image: product.image[0],
            });
          }
        }
      }

      setCartData(tempData);
    }
  }, [cartItems, products]);

  const isCartEmpty = getCartCount() === 0;

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3 font-semibold text-gray-800">
        <Title text1="GIỎ" text2="HÀNG" />
      </div>

      <div className="space-y-4">
        {cartData.map((item, index) => {
          const productData = products.find((p) => p._id === item._id);
          return (
            <div
              key={index}
              className="py-5 px-4 border rounded-xl bg-white shadow-sm grid grid-cols-[4fr_1fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 hover:shadow-md transition duration-200"
            >
              <div className="flex items-start gap-4">
                <img
                  className="w-16 sm:w-20 rounded-md object-cover"
                  src={productData.image[0]}
                  alt={productData.name}
                />
                <div>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {productData.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                    <p className="font-medium">
                      {item.price.toLocaleString("vi-VN")} {currency}
                    </p>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border text-gray-500">
                      Size: {item.size}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 border text-gray-500">
                      Màu: {item.color}
                    </span>
                  </div>
                </div>
              </div>

              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  const newQuantity = Number(e.target.value);
                  if (newQuantity > 0) {
                    updateQuantity(
                      item._id,
                      item.size,
                      item.color,
                      newQuantity
                    );
                  }
                }}
                className="border rounded-md px-3 py-1 w-16 sm:w-20 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={() => removeFromCart(item._id, item.size, item.color)}
                className="text-red-500 hover:text-red-600 transition"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-16">
        <div className="w-full sm:w-[450px]">
          <CartSummary />
          <div className="text-end">
            <button
              onClick={() => navigate("/place-order")}
              className={`bg-black text-white text-sm mt-6 px-8 py-3 rounded-md shadow hover:bg-gray-800 transition duration-200 ${
                isCartEmpty ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCartEmpty}
            >
              TIẾN HÀNH ĐẶT HÀNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
