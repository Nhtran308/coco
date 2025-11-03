import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProduct, setLatestProduct] = useState([]);

  useEffect(() => {
    const sortedProducts = [...products].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setLatestProduct(sortedProducts.slice(0, 10));
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-left pb-8 text-3xl">
        <h2 className="text-3xl md:text-4xl font-medium text-left text-gray-800 mt-6">
          SẢN PHẨM MỚI
        </h2>
      </div>
      {/* Hiển thị sản phẩm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {latestProduct.map((item, index) => (
          <ProductItem
            key={index}
            name={item.name}
            id={item._id}
            price={item.price}
            image={item.image}
            salePrice={item.salePrice}
            category={item.category}
            averageReview={item.averageReview}
            totalStock={item.totalStock}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
