import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import { FaTrash, FaEdit, FaExclamationCircle } from "react-icons/fa";
import { exportToExcel } from "../utils/exportToExcel";
import exportPDF from "../utils/exportToPDF";
const itemsPerPage = 8;

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editProductData, setEditProductData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const listToDisplay = list.slice(startIndex, endIndex);
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

  const handleEditClick = (item) => {
    setEditProductData(item);
    setIsEditing(true);
  };

  // HIỂN THỊ SẢN PHẨM
  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // XÓA SẢN PHẨM
  const removeProduct = async (id) => {
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa sản phẩm này?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("ĐÃ XÓA SẢN PHẨM");
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // CẬP NHẬT SẢN PHẨM
  const updateProduct = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/product/edit/${editProductData._id}`,
        {
          name: editProductData.name,
          description: editProductData.description,
          price: editProductData.price,
          salePrice: editProductData.salePrice,
          brand: editProductData.brand,
          totalStock: editProductData.totalStock,
          category: editProductData.category,
          subCategory: editProductData.subCategory,
          colors: editProductData.colors,
          sizes: editProductData.sizes,
          bestseller: editProductData.bestseller,
        },
        {
          headers: { token },
        }
      );

      if (response.data.success) {
        toast.success("Sản phẩm đã được cập nhật");
        setIsEditing(false);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật sản phẩm");
    }
  };

  const handleExportExcel = () => {
    const exportData = list.map(
      ({ name, category, brand, price, salePrice, totalStock }) => ({
        "Tên sản phẩm": name,
        "Danh mục": category,
        "Nhãn hàng": brand,
        Giá: price,
        "Giá sale": salePrice,
        "Tồn kho": totalStock,
      })
    );

    exportToExcel(exportData, "DanhSachSanPham.xlsx", "Sản phẩm");
  };

  const handleExportPDF = () => {
    const exportData = list.map(
      ({ name, category, brand, price, salePrice, totalStock }) => ({
        name,
        category,
        brand,
        price: price.toLocaleString("vi-VN") + "₫",
        salePrice: salePrice.toLocaleString("vi-VN") + "₫",
        totalStock,
      })
    );

    const columnOrder = [
      "name",
      "category",
      "brand",
      "price",
      "salePrice",
      "totalStock",
    ];

    const columnMapping = {
      name: "Tên sản phẩm",
      category: "Danh mục",
      brand: "Nhãn hàng",
      price: "Giá",
      salePrice: "Giá sale",
      totalStock: "Tồn kho",
    };

    exportPDF(
      exportData,
      "Sản phẩm",
      "DanhSachSanPham.pdf",
      columnOrder,
      columnMapping
    );
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      {!isEditing && (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="font-bold text-2xl mb-6">TẤT CẢ SẢN PHẨM</p>

            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Xuất Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Xuất PDF
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded-t-lg shadow-sm">
            <span>HÌNH ẢNH</span>
            <span>TÊN SẢN PHẨM</span>
            <span>DANH MỤC</span>
            <span>NHÃN HÀNG</span>
            <span>GIÁ</span>
            <span>SALE</span>
            <span>TỒN KHO</span>
            <span className="text-center">THAO TÁC</span>
          </div>

          {/* Product List */}
          {listToDisplay.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-2 py-3 px-4 border hover:bg-gray-50 transition text-sm rounded-lg shadow-sm"
            >
              <img
                className="w-12 h-12 object-cover rounded"
                src={item.image[0]}
                alt=""
              />
              <p className="truncate">{item.name}</p>
              <p className="text-left">{item.category}</p>
              <p className="text-left">{item.brand}</p>
              <p className="text-left text-green-600 font-medium">
                {item.price.toLocaleString("vi-VN")}
              </p>
              <p className="text-left text-red-500 font-medium">
                {item.salePrice.toLocaleString("vi-VN")}
              </p>
              <p className="text-left">
                {item.totalStock}
                {item.totalStock < 20 && (
                  <FaExclamationCircle className="inline ml-2 text-red-600" />
                )}
              </p>
              <div className="flex justify-end md:justify-center items-center gap-3 text-lg">
                <FaTrash
                  className="text-red-500 hover:text-red-700 transition cursor-pointer"
                  onClick={() => removeProduct(item._id)}
                />
                <FaEdit
                  className="text-green-500 hover:text-green-700 transition cursor-pointer"
                  onClick={() => handleEditClick(item)}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === i + 1
                    ? "bg-red-500 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl w-[90%] max-w-[900px] p-6 max-h-[90vh] overflow-y-auto shadow-lg relative">
            <h2 className="text-2xl font-bold mb-4">Cập nhật sản phẩm</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProduct();
              }}
              className="flex flex-col gap-4"
            >
              {/* Hình ảnh */}
              <div>
                <p className="font-semibold mb-1">Hình ảnh sản phẩm</p>
                <div className="flex gap-2 flex-wrap">
                  {editProductData?.image?.map((img, idx) => (
                    <label
                      key={idx}
                      htmlFor={`image${idx}`}
                      className="cursor-pointer"
                    >
                      <img
                        src={
                          img instanceof File
                            ? URL.createObjectURL(img)
                            : img || assets.upload_area
                        }
                        alt={`product-${idx}`}
                        className="w-20 h-20 object-cover border rounded"
                      />
                      <input
                        type="file"
                        id={`image${idx}`}
                        hidden
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files.length > 0) {
                            setEditProductData((prev) => ({
                              ...prev,
                              image: [
                                ...prev.image.slice(0, idx),
                                files[0],
                                ...prev.image.slice(idx + 1),
                              ],
                            }));
                          }
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <label className="font-semibold mb-1 block">Tên sản phẩm</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded"
                  value={editProductData?.name || ""}
                  onChange={(e) =>
                    setEditProductData({
                      ...editProductData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="font-semibold mb-1 block">Mô tả</label>
                <textarea
                  className="w-full px-3 py-2 border rounded min-h-[100px]"
                  value={editProductData?.description || ""}
                  onChange={(e) =>
                    setEditProductData({
                      ...editProductData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              {/* Nhãn hàng, Danh mục, Loại sản phẩm */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="font-semibold mb-1 block">Nhãn hàng</label>
                  <select
                    className="w-full px-3 py-2 border rounded"
                    value={editProductData?.brand || ""}
                    onChange={(e) =>
                      setEditProductData({
                        ...editProductData,
                        brand: e.target.value,
                      })
                    }
                  >
                    <option value="Coco">Coco</option>
                  </select>
                </div>
                <div className="flex-1">
                  <p className="mb-2 font-semibold">Danh mục</p>
                  <select
                    value={editProductData?.category || ""}
                    onChange={(e) => {
                      const selected = e.target.value;
                      let newSubCategory = "";
                      if (selected === "Áo") newSubCategory = "Áo thun";
                      else if (selected === "Quần") newSubCategory = "Quần dài";
                      else if (selected === "Áo khoác")
                        newSubCategory = "Áo khoác nỉ";
                      else if (selected === "Phụ kiện") newSubCategory = "Túi";

                      setEditProductData({
                        ...editProductData,
                        category: selected,
                        subCategory: newSubCategory,
                      });
                    }}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="Áo">Áo</option>
                    <option value="Quần">Quần</option>
                    <option value="Áo khoác">Áo khoác</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                  </select>
                </div>

                <div className="flex-1">
                  <p className="mb-2 font-semibold">Loại sản phẩm</p>
                  <select
                    value={editProductData?.subCategory || ""}
                    onChange={(e) =>
                      setEditProductData({
                        ...editProductData,
                        subCategory: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    {subCategoryOptions[editProductData?.category]?.map(
                      (item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Giá và Khuyến mãi */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="font-semibold mb-1 block">Giá</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="VND"
                    value={editProductData?.price || ""}
                    onChange={(e) =>
                      setEditProductData({
                        ...editProductData,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="font-semibold mb-1 block">Khuyến mãi</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="VND"
                    value={editProductData?.salePrice || ""}
                    onChange={(e) => {
                      const sale = e.target.value;
                      if (parseInt(sale) > parseInt(editProductData?.price)) {
                        toast.error("Khuyến mãi không được lớn hơn giá");
                        return;
                      }
                      setEditProductData({
                        ...editProductData,
                        salePrice: sale,
                      });
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="font-semibold mb-1 block">Tồn kho</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    value={editProductData?.totalStock || ""}
                    onChange={(e) =>
                      setEditProductData({
                        ...editProductData,
                        totalStock: Math.max(0, e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Màu sắc */}
              <div>
                <p className="font-semibold mb-1">Màu sắc</p>
                <div className="flex gap-3 flex-wrap">
                  {["Black", "White", "Red", "Blue", "Yellow"].map(
                    (color, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full cursor-pointer border ${
                          editProductData?.colors?.includes(color)
                            ? "border-black"
                            : "border-gray-300"
                        } flex items-center justify-center`}
                        onClick={() =>
                          setEditProductData((prev) => ({
                            ...prev,
                            colors: prev.colors.includes(color)
                              ? prev.colors.filter((c) => c !== color)
                              : [...prev.colors, color],
                          }))
                        }
                        style={{ backgroundColor: color.toLowerCase() }}
                      >
                        {editProductData?.colors?.includes(color) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Bestseller */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bestseller"
                  checked={editProductData?.bestseller || false}
                  onChange={(e) =>
                    setEditProductData({
                      ...editProductData,
                      bestseller: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="bestseller"
                  className="font-semibold cursor-pointer"
                >
                  Sản phẩm bán chạy
                </label>
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
