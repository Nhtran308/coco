import React, { useContext, useEffect, useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useLocation } from "react-router-dom";
import { ProductCard, Title } from "../../components/user";
import { ShopContext } from "../../context/ShopContext";
import { assets } from "../../assets/assets";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("best-sellers");
  const [currentPage, setCurrentPage] = useState(1);
  const [openCategory, setOpenCategory] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const location = useLocation();

  const itemsPerPage = 8;

  const categoryMap = {
    Áo: [
      { value: "Áo thun", label: "Áo thun" },
      { value: "Áo sơ mi", label: "Áo sơ mi" },
    ],
    Quần: [
      { value: "Quần dài", label: "Quần dài" },
      { value: "Quần ngắn", label: "Quần ngắn" },
      { value: "Váy", label: "Váy" },
    ],
    "Áo khoác": [
      { value: "Áo khoác nỉ", label: "Áo khoác nỉ" },
      { value: "Áo khoác dù", label: "Áo khoác dù" },
      { value: "Áo khoác phao", label: "Áo khoác phao" },
      { value: "Áo khoác len", label: "Áo khoác len" },
    ],
    "Phụ kiện": [
      { value: "Túi", label: "Túi" },
      { value: "Dép", label: "Dép" },
      { value: "Vớ", label: "Vớ" },
      { value: "Móc khóa", label: "Móc khóa" },
    ],
  };

  useEffect(() => {
    if (location.state) {
      const { preselectedCategory, preselectedSubCategory } = location.state;

      if (preselectedCategory) {
        setCategory([preselectedCategory]);
      }

      if (preselectedSubCategory) {
        setSubCategory([preselectedSubCategory]);
      }
    }
  }, [location.state]);

  const toggleCategory = (e) => {
    const value = e.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const applyFilter = () => {
    let filtered = [...products];

    if (search && showSearch) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      filtered = filtered.filter((item) => category.includes(item.category));
    }

    if (subCategory.length > 0) {
      filtered = filtered.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    if (priceRange.min || priceRange.max) {
      const min = parseFloat(priceRange.min) || 0;
      const max = parseFloat(priceRange.max) || Infinity;
      filtered = filtered.filter((item) => {
        const price = item.salePrice || item.price;
        return price >= min && price <= max;
      });
    }

    return filtered;
  };

  const sortProduct = (list) => {
    const sorted = [...list];
    switch (sortType) {
      case "low-high":
        sorted.sort(
          (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
        );
        break;
      case "high-low":
        sorted.sort(
          (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
        );
        break;
      case "a-z":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "best-sellers":
        if (Array.isArray(sorted)) {
          sorted.sort((a, b) => {
            const totalSoldA = Number(a.totalSold) || 0;
            const totalSoldB = Number(b.totalSold) || 0;
            return totalSoldB - totalSoldA;
          });
        } else {
          console.log("sorted không phải là mảng");
        }
        break;
    }
    return sorted;
  };

  useEffect(() => {
    const filtered = applyFilter();
    const sorted = sortProduct(filtered);
    setFilterProducts(sorted);
    setCurrentPage(1);
  }, [
    products,
    search,
    showSearch,
    category,
    subCategory,
    sortType,
    priceRange,
  ]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const currentProducts = filterProducts.slice(
    indexOfLastItem - itemsPerPage,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filterProducts.length / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t border-gray-200 ">
      {/* BỘ LỌC */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2 font-semibold text-gray-800"
        >
          LỌC THEO
          <img
            className={`h-3 sm:hidden transition-transform duration-300 ${
              showFilter ? "rotate-90" : ""
            }`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        {/* DANH MỤC */}
        <div
          className={`rounded-lg border border-gray-300 pl-5 py-3 mt-6 shadow-sm bg-white ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium text-gray-700">DANH MỤC</p>
          <div className="flex flex-col gap-3 text-sm font-light text-gray-700">
            {Object.entries(categoryMap).map(([catName, subCats]) => (
              <div key={catName} className="rounded-md">
                <div
                  className="flex justify-between items-center cursor-pointer px-2 py-2 hover:bg-gray-100 rounded transition"
                  onClick={() =>
                    setOpenCategory(openCategory === catName ? null : catName)
                  }
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-3 h-3 rounded accent-indigo-500"
                      value={catName}
                      onChange={toggleCategory}
                      checked={category.includes(catName)}
                    />
                    <span className="font-medium">{catName.toUpperCase()}</span>
                  </label>
                  <img
                    src={assets.dropdown_icon}
                    className={`h-3 transition-transform duration-200 ${
                      openCategory === catName ? "rotate-90" : ""
                    }`}
                    alt="toggle"
                  />
                </div>

                {openCategory === catName && (
                  <div className="ml-6 mt-2 flex flex-col gap-2">
                    {subCats.map((sub) => (
                      <label
                        key={sub.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          className="w-3 h-3 rounded accent-indigo-500"
                          value={sub.value}
                          onChange={toggleSubCategory}
                          checked={subCategory.includes(sub.value)}
                        />
                        <span>{sub.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GIÁ */}
        <div
          className={`rounded-lg border border-gray-300 pl-5 py-3 mt-6 shadow-sm bg-white ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium text-gray-700">GIÁ</p>
          <div className="px-2 mr-3">
            <Slider
              range
              min={0}
              max={500000}
              defaultValue={[0, 500000]}
              step={10000}
              onAfterChange={(value) =>
                setPriceRange({ min: value[0], max: value[1] })
              }
              trackStyle={[{ backgroundColor: "#830000" }]}
              handleStyle={[
                { backgroundColor: "#830000", borderColor: "#830000" },
                { backgroundColor: "#830000", borderColor: "#830000" },
              ]}
              railStyle={{ backgroundColor: "#e5e7eb" }}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{priceRange.min.toLocaleString()}₫</span>
              <span>{priceRange.max.toLocaleString()}₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-base sm:text-2xl mb-4 gap-4">
          <Title text1="TẤT CẢ" text2="SẢN PHẨM" />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="best-sellers">Sản phẩm bán chạy</option>
            <option value="newest">Sản phẩm mới nhất</option>
            <option value="relavent">Liên quan</option>
            <option value="low-high">Giá: thấp đến cao</option>
            <option value="high-low">Giá: cao xuống thấp</option>
            <option value="a-z">Tên: A-Z</option>
            <option value="z-a">Tên: Z-A</option>
          </select>
        </div>

        {currentProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            Không tìm thấy sản phẩm nào.
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
              {currentProducts.map((item) => (
                <ProductCard
                  key={item._id}
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

            {/* PHÂN TRANG */}
            <div className="flex items-center gap-2 text-gray-500 mt-6 justify-center w-full">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="mr-4 px-3 py-1 rounded hover:bg-gray-200 transition disabled:text-gray-300"
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded transition ${
                    currentPage === i + 1
                      ? "bg-rred text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="ml-4 px-3 py-1 rounded hover:bg-gray-200 transition disabled:text-gray-300"
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;
