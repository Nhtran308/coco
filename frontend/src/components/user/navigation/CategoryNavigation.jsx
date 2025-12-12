import { useContext } from "react";
import { ShopContext } from "../../../context/ShopContext";
import { assets } from "../../../assets/assets";

const CategoryNavigation = () => {
  const { navigate } = useContext(ShopContext);

  const categories = [
    {
      name: "Áo",
      label: "ÁO",
      image: assets.top_cate,
      path: "/collection",
    },
    {
      name: "Quần",
      label: "QUẦN",
      image: assets.bottom_cate,
      path: "/collection",
    },
    {
      name: "Áo khoác",
      label: "ÁO KHOÁC",
      image: assets.oute_cate,
      path: "/collection",
    },
    {
      name: "Phụ kiện",
      label: "PHỤ KIỆN",
      image: assets.access_cate,
      path: "/collection",
    },
  ];

  const handleClick = (category) => {
    navigate("/collection", { state: { preselectedCategory: category } });
  };

  return (
    <div className="flex flex-col items-center text-center pt-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-7xl">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-xl shadow-md w-full aspect-square mx-auto"
            onClick={() => handleClick(cat.name)}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-3xl font-bold opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                {cat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavigation;
