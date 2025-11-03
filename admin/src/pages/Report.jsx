import React, { useState, useEffect } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import {
  exportMultipleSheetsToExcel,
  exportToExcel,
} from "../utils/exportToExcel";
import exportPDF, { createPDFDocument, addTable } from "../utils/exportToPDF";

const Report = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [quantitySold, setQuantitySold] = useState(null);
  const [totalCustomers, setTotalCustomers] = useState(null);
  const [returnRate, setReturnRate] = useState(null);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [topDistricts, setTopDistricts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExport, setSelectedExport] = useState("all");

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
    if (!token) {
      toast.error("Token không tồn tại!");
      setLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [
        revenueRes,
        customersRes,
        returnRateRes,
        bestSellingRes,
        districtsRes,
        monthlyRevRes,
        yearlyRevRes,
        topCustomersRes,
      ] = await Promise.all([
        axios.get(`${backendUrl}/api/report/revenue`, { headers }),
        axios.get(`${backendUrl}/api/report/customers`, { headers }),
        axios.get(`${backendUrl}/api/report/return-rate`, { headers }),
        axios.get(`${backendUrl}/api/report/best-selling-products`, {
          headers,
        }),
        axios.get(`${backendUrl}/api/report/top-districts`, { headers }),
        axios.get(`${backendUrl}/api/report/monthly-revenue`, { headers }),
        axios.get(`${backendUrl}/api/report/yearly-revenue`, { headers }),
        axios.get(`${backendUrl}/api/report/top-customers`, { headers }),
      ]);

      setRevenueData(revenueRes.data.totalRevenue);
      setQuantitySold(revenueRes.data.totalQuantitySold);
      setTotalCustomers(customersRes.data.totalCustomers);
      setReturnRate(returnRateRes.data.returnRate);
      setBestSellingProducts(bestSellingRes.data.products);
      setTopDistricts(districtsRes.data.districts);
      setMonthlyRevenue(monthlyRevRes.data.monthlyRevenue);
      setYearlyRevenue(yearlyRevRes.data.yearlyRevenue);
      setTopCustomers(topCustomersRes.data.topCustomers || []);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    let dataToExport = [];
    let fileName = "";

    switch (selectedExport) {
      case "topProducts":
        dataToExport = bestSellingProducts;
        fileName = "TopSanPham.xlsx";
        break;
      case "topDistricts":
        dataToExport = topDistricts;
        fileName = "TopQuan.xlsx";
        break;
      case "topCustomers":
        dataToExport = topCustomers;
        fileName = "TopKhachHang.xlsx";
        break;
      case "monthlyRevenue":
        dataToExport = monthlyRevenue;
        fileName = "DoanhThuThang.xlsx";
        break;
      case "yearlyRevenue":
        dataToExport = yearlyRevenue;
        fileName = "DoanhThuNam.xlsx";
        break;
      case "all":
        exportMultipleSheetsToExcel(
          [
            {
              sheetName: "Top Sản phẩm",
              data: bestSellingProducts,
            },
            {
              sheetName: "Top Quận",
              data: topDistricts,
            },
            {
              sheetName: "Top Khách hàng",
              data: topCustomers,
            },
            {
              sheetName: "Doanh thu tháng",
              data: monthlyRevenue,
            },
            {
              sheetName: "Doanh thu năm",
              data: yearlyRevenue,
            },
          ],
          "BaoCaoTongHop.xlsx"
        );
        return;
      default:
        break;
    }

    exportToExcel(dataToExport, fileName);
  };

  const handleExportPDF = () => {
    const configs = {
      topProducts: {
        data: bestSellingProducts,
        title: "CÁC SẢN PHẨM BÁN CHẠY",
        fileName: "top-products.pdf",
        columnOrder: ["_id", "totalSold"],
        columnMapping: { _id: "Tên sản phẩm", totalSold: "Số lượng bán" },
      },
      topDistricts: {
        data: topDistricts,
        title: "CÁC QUẬN CÓ ĐƠN THÀNH CÔNG NHIỀU",
        fileName: "top-districts.pdf",
        columnOrder: ["_id", "totalOrders"],
        columnMapping: { _id: "Quận", totalOrders: "Số đơn thành công" },
      },
      topCustomers: {
        data: topCustomers,
        title: "DANH SÁCH KHÁCH HÀNG",
        fileName: "top-customers.pdf",
        columnOrder: ["_id", "fullName", "totalOrders", "totalSpent"],
        columnMapping: {
          _id: "Mã khách hàng",
          fullName: "Tên khách hàng",
          totalOrders: "Số đơn hàng",
          totalSpent: "Tổng chi tiêu",
        },
      },
      monthlyRevenue: {
        data: monthlyRevenue,
        title: "DOANH THU THEO THÁNG",
        fileName: "monthly-revenue.pdf",
        columnOrder: ["month", "totalRevenue"],
        columnMapping: { month: "Tháng", totalRevenue: "Doanh thu (VNĐ)" },
      },
      yearlyRevenue: {
        data: yearlyRevenue,
        title: "DOANH THU THEO NĂM",
        fileName: "yearly-revenue.pdf",
        columnOrder: ["year", "totalRevenue"],
        columnMapping: { year: "Năm", totalRevenue: "Doanh thu (VNĐ)" },
      },
    };

    if (selectedExport === "all") {
      const { doc, header, footer } = createPDFDocument();

      const entries = Object.entries(configs);

      entries.forEach(([key, config], index) => {
        const isLastTable = index === entries.length - 1;

        addTable(
          doc,
          config.data,
          config.title,
          header,
          footer,
          config.columnOrder,
          config.columnMapping,
          isLastTable
        );
      });

      doc.save("bao-cao-tong-hop.pdf");
    } else if (configs[selectedExport]) {
      const { data, title, fileName, columnOrder, columnMapping } =
        configs[selectedExport];
      exportPDF(data, title, fileName, columnOrder, columnMapping);
    }
  };

  // Card Component
  const Card = ({
    title,
    value,
    suffix = "",
    isCurrency = false,
    icon,
    bg = "white",
  }) => (
    <div className={`bg-${bg} p-4 rounded shadow flex items-center gap-4`}>
      {icon && <div className="text-3xl text-gray-500">{icon}</div>}
      <div>
        <div className="text-gray-600">{title}</div>
        <div className="text-xl font-bold mt-1">
          {isCurrency
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(value || 0)
            : `${value || 0} ${suffix}`}
        </div>
      </div>
    </div>
  );

  // Chart Container Component
  const ChartContainer = ({ title, children }) => (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );

  useEffect(() => {
    fetchReports();
  }, [token]);

  if (loading) return <div>Đang tải dữ liệu báo cáo...</div>;

  return (
    <div className="min-h-screen p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <p className="text-2xl font-semibold text-[#2F4155] tracking-wide">
          BÁO CÁO DOANH THU
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <select
            value={selectedExport}
            onChange={(e) => setSelectedExport(e.target.value)}
            className="p-2 border border-[#567C8D] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#567C8D]"
          >
            <option value="all">Tất cả</option>
            <option value="topProducts">Top sản phẩm bán chạy</option>
            <option value="topDistricts">Top quận mua nhiều</option>
            <option value="topCustomers">Top khách hàng</option>
            <option value="monthlyRevenue">Doanh thu theo tháng</option>
            <option value="yearlyRevenue">Doanh thu theo năm</option>
          </select>

          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
              onClick={handleExport}
            >
              Xuất Excel
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm transition"
              onClick={handleExportPDF}
            >
              Xuất PDF
            </button>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Doanh thu" value={revenueData} isCurrency />
        <Card title="Số lượng bán ra" value={quantitySold} suffix="sản phẩm" />
        <Card title="Số lượng khách hàng" value={totalCustomers} />
        <Card title="Tỷ lệ hoàn hàng" value={returnRate} suffix="%" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ChartContainer title="Top sản phẩm bán chạy">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "pie" },
              title: null,
              series: [
                {
                  name: "Sản phẩm",
                  data: bestSellingProducts.map((item) => [
                    item._id,
                    item.totalSold,
                  ]),
                },
              ],
              plotOptions: {
                pie: {
                  innerSize: "50%",
                  dataLabels: { enabled: true },
                },
              },
              credits: { enabled: false },
            }}
          />
        </ChartContainer>

        <ChartContainer title="Top quận mua nhiều nhất">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "pie" },
              title: null,
              series: [
                {
                  name: "Đơn hàng",
                  data: topDistricts.map((item) => [
                    item._id,
                    item.totalOrders,
                  ]),
                },
              ],
              plotOptions: {
                pie: {
                  innerSize: "50%",
                  dataLabels: { enabled: true },
                },
              },
              credits: { enabled: false },
            }}
          />
        </ChartContainer>

        <ChartContainer title="Top khách hàng mua nhiều nhất">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "column" },
              title: null,
              xAxis: {
                categories: topCustomers.map(
                  (item) => item.fullName || "Khách"
                ),
              },
              yAxis: { title: { text: "Chi tiêu (VND)" } },
              series: [
                {
                  name: "Chi tiêu",
                  data: topCustomers.map((item) => item.totalSpent),
                },
              ],
              credits: { enabled: false },
            }}
          />
        </ChartContainer>

        <ChartContainer title="Doanh thu theo tháng">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "column" },
              title: null,
              xAxis: {
                categories: monthlyRevenue.map((item) => `Tháng ${item.month}`),
              },
              yAxis: { title: { text: "VND" } },
              series: [
                {
                  name: "Doanh thu",
                  data: monthlyRevenue.map((item) => item.totalRevenue),
                },
              ],
              credits: { enabled: false },
            }}
          />
        </ChartContainer>

        <ChartContainer title="Doanh thu theo năm">
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: "column" },
              title: null,
              xAxis: {
                categories: yearlyRevenue.map((item) => `Năm ${item.year}`),
              },
              yAxis: { title: { text: "VND" } },
              series: [
                {
                  name: "Doanh thu",
                  data: yearlyRevenue.map((item) => item.totalRevenue),
                },
              ],
              credits: { enabled: false },
            }}
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default Report;
