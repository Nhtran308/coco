import React, { useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("Top");
  const [brand, setBrand] = useState("Coco");
  const [subCategory, setSubCategory] = useState("Tees");
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [totalStock, setTotalStock] = useState("");
  const [bestseller, setBestseller] = useState(false);
  const [averageReview, setAverageReview] = useState("");

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];
  const subCategoryOptions = {
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

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!image1 && !image2 && !image3 && !image4) {
      toast.error("Bạn cần chọn ít nhất 1 hình ảnh!");
      return;
    }

    if (!name || !description || !price || !totalStock) {
      toast.error("Vui lòng điền đầy đủ tên, mô tả, giá và số lượng!");
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      toast.error("Giá phải là một số hợp lệ!");
      return;
    }

    if (salePrice && (isNaN(salePrice) || parseFloat(salePrice) <= 0)) {
      toast.error("Giá khuyến mãi phải là một số hợp lệ!");
      return;
    }

    if (isNaN(totalStock) || parseInt(totalStock) <= 0) {
      toast.error("Số lượng phải là một số hợp lệ và lớn hơn 0!");
      return;
    }

    if (colors.length === 0) {
      toast.error("Bạn cần chọn ít nhất 1 màu!");
      return;
    }

    if (sizes.length === 0) {
      toast.error("Bạn cần chọn ít nhất 1 kích cỡ!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("salePrice", salePrice);
      formData.append("category", category);
      formData.append("brand", brand);
      formData.append("subCategory", subCategory);
      formData.append("colors", JSON.stringify(colors));
      formData.append("totalStock", totalStock);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("averageReview", averageReview);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setSalePrice("");
        setTotalStock("");
        setSizes([]);
        setColors([]);
        setBestseller(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message || "Đã có lỗi xảy ra!";
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-4"
    >
      {/* Tiêu đề */}
      <p className="font-bold text-2xl mb-6">THÊM SẢN PHẨM</p>

      {/* Hình ảnh sản phẩm */}
      <div>
        <p className="mb-2 font-semibold">Hình ảnh sản phẩm</p>
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((img, i) => (
            <label key={i} htmlFor={`image${i + 1}`}>
              <img
                className="w-20 h-20 object-cover"
                src={!img ? assets.upload_area : URL.createObjectURL(img)}
                alt={`Hình ${i + 1}`}
              />
              <input
                type="file"
                id={`image${i + 1}`}
                hidden
                multiple={i === 0}
                onChange={(e) => {
                  const files = e.target.files;
                  if (i === 0) {
                    if (files.length > 4) {
                      toast.error("Bạn chỉ được chọn tối đa 4 tấm hình");
                    } else {
                      setImage1(files[0] || null);
                      setImage2(files[1] || null);
                      setImage3(files[2] || null);
                      setImage4(files[3] || null);
                    }
                  } else {
                    [setImage2, setImage3, setImage4][i - 1](files[0]);
                  }
                }}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Tên sản phẩm */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Tên sản phẩm</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full max-w-[700px] px-3 py-2"
        />
      </div>

      {/* Mô tả sản phẩm */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Mô tả</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full max-w-[700px] px-3 py-4"
        />
      </div>

      {/* Nhãn hàng, danh mục, loại, giá, khuyến mãi */}
      <div className="flex flex-col sm:flex-row gap-4 w-full flex-wrap">
        <div>
          <p className="mb-2 font-semibold">Nhãn hàng</p>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Coco">Coco</option>
          </select>
        </div>

        <div>
          <p className="mb-2 font-semibold">Danh mục</p>
          <select
            value={category}
            onChange={(e) => {
              const selected = e.target.value;
              setCategory(selected);
              if (selected === "Áo") setSubCategory("Áo thun");
              else if (selected === "Quần") setSubCategory("Quần dài");
              else if (selected === "Áo khoác") setSubCategory("Áo khoác nỉ");
              else if (selected === "Phụ kiện") setSubCategory("Túi");
              else setSubCategory("");
            }}
            className="w-full px-3 py-2"
          >
            <option value="Áo">Áo</option>
            <option value="Quần">Quần</option>
            <option value="Áo khoác">Áo khoác</option>
            <option value="Phụ kiện">Phụ kiện</option>
          </select>
        </div>

        <div>
          <p className="mb-2 font-semibold">Loại sản phẩm</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            {subCategoryOptions[category]?.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 font-semibold">Giá</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 sm:w-[120px]"
            placeholder="VND"
          />
        </div>

        <div>
          <p className="mb-2 font-semibold">Khuyến mãi</p>
          <input
            type="number"
            value={salePrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              setSalePrice(value > price ? price : value);
            }}
            className="w-full px-3 py-2 sm:w-[120px]"
            placeholder="VND"
          />
        </div>
      </div>

      {/* Số lượng */}
      <div className="w-full">
        <p className="mb-2 font-semibold">Số lượng sản phẩm</p>
        <input
          type="number"
          min="0"
          value={totalStock}
          onChange={(e) => setTotalStock(e.target.value)}
          className="w-full px-3 py-2 sm:w-[120px]"
        />
      </div>

      {/* Màu sắc */}
      <div>
        <p className="mb-2 font-semibold">Màu</p>
        <div className="flex gap-3">
          {["Black", "White", "Red", "Blue", "Yellow"].map((color) => (
            <div
              key={color}
              onClick={() =>
                setColors((prev) =>
                  prev.includes(color)
                    ? prev.filter((item) => item !== color)
                    : [...prev, color]
                )
              }
              className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                colors.includes(color)
                  ? "border-2 border-black"
                  : "border border-gray-300"
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
            >
              {colors.includes(color) && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kích cỡ */}
      <div>
        <p className="mb-2 font-semibold">Kích cỡ</p>
        <div className="flex gap-3">
          {sizeOptions.map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((item) => item !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`px-3 py-1 cursor-pointer ${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                }`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sản phẩm bán chạy */}
      <div className="flex gap-2 mt-4">
        <input
          type="checkbox"
          id="bestseller"
          checked={bestseller}
          onChange={(e) => setBestseller(e.target.checked)}
        />
        <label htmlFor="bestseller" className="cursor-pointer font-semibold">
          Sản phẩm bán chạy
        </label>
      </div>

      {/* Nút thêm sản phẩm */}
      <button
        type="submit"
        className="w-28 py-3 mt-6 bg-black text-white font-semibold"
      >
        THÊM
      </button>
    </form>
  );
};

export default Add;
