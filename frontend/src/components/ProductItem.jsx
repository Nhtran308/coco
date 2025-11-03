import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const ProductItem = ({
  id,
  image,
  name,
  price,
  salePrice,
  averageReview,
  totalStock,
}) => {
  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
        <div className="overflow-hidden relative group">
          {salePrice < price && (
            <span className="absolute left-2 top-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
              SALE
            </span>
          )}

          {totalStock <= 10 ? (
            <span className="absolute right-2 top-2 bg-gray-400 text-white text-[10px] font-bold px-2 py-1 rounded z-20">
              HẾT HÀNG
            </span>
          ) : totalStock > 10 && totalStock < 20 ? (
            <span className="absolute right-2 top-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded z-20">
              CÒN {Math.max(0, totalStock - 10)} SẢN PHẨM
            </span>
          ) : null}

          <div className="relative group overflow-hidden rounded-xl">
            <img
              className={`w-full h-auto mb-4 rounded-xl transition-all duration-300 ease-in-out ${
                image[1] ? "group-hover:opacity-0" : ""
              }`}
              src={image[0]}
              alt={name}
            />
            {image[1] && (
              <img
                className="w-full h-auto mb-4 rounded-xl absolute top-0 left-0 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                src={image[1]}
                alt={`${name} - preview`}
              />
            )}
          </div>
        </div>

        {/* Product info */}
        <div className="text-gray-500/80 text-sm">
          {/* Name */}
          <p className="text-pine font-medium text-base truncate w-full tracking-tight leading-snug">
            {name}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            {Array(5)
              .fill("")
              .map((_, i) => {
                const isFilled = averageReview > i;
                return (
                  <img
                    key={i}
                    src={isFilled ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                    className="w-4 h-4"
                  />
                );
              })}
            <p className="text-xs text-gray-500">({averageReview})</p>
          </div>

          {/* Price block */}
          <div className="flex justify-between items-baseline mt-3">
            <p className="text-xl font-semibold text-rred">
              {salePrice.toLocaleString()}₫
            </p>
            {salePrice < price && (
              <p className="text-sm text-gray-400 line-through">
                {price.toLocaleString()}₫
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
