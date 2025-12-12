import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../../context/ShopContext";
import Title from "../ui/Title";
import ProductCard from "./ProductCard";

const BestProduct = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <div className="my-10">
      <div className="w-full h-px bg-gray-300 my-8"></div>
      <div className="text-center text-3xl py-8">
        <Title text1={"SẢN PHẨM"} text2="BÁN CHẠY" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSeller.map((item, index) => (
          <ProductCard
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

export default BestProduct;
