import { useContext, useEffect, useState } from "react";
import Title from "../ui/Title";
import ProductCard from "./ProductCard";
import { ShopContext } from "../../../context/ShopContext";

const RelatedProduct = ({ category, subCategory }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      let productCopy = products.slice();
      productCopy = productCopy.filter((item) => category === item.category);
      productCopy = productCopy.filter(
        (item) => subCategory === item.subCategory
      );

      setRelated(productCopy.slice(0, 5));
    }
  }, [products]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={"SẢN PHẨM"} text2={"TƯƠNG TỰ"} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => (
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

export default RelatedProduct;
