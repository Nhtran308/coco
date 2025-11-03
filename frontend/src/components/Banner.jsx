import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const Banner = () => {
  const images = [
    {
      src: assets.banner_1,
      link: "http://localhost:5173/product/6847fdbd89e0f6ea8b93a0d6",
    },
    {
      src: assets.banner_2,
      link: "http://localhost:5173/product/6847ff0d89e0f6ea8b93a0dc",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Slider */}
      <div className="relative flex justify-center w-full">
        {images.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className={`block transition-opacity duration-700 ${
              index === current ? "opacity-100" : "opacity-0 absolute"
            }`}
          >
            <img
              src={item.src}
              alt={`banner-${index}`}
              className="w-full rounded-2xl shadow-lg hidden md:block"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Banner;
