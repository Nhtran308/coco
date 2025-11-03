import axios from "axios";
import React, { useEffect, useState } from "react";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

const Revenue = ({ token }) => {
  const [list, setList] = useState([]);
  const [report, setReport] = useState(null);
  const [salaryByMonth, setSalaryByMonth] = useState([]);
  const [cancelReasons, setCancelReasons] = useState([]);
  const [districtStats, setDistrictStats] = useState([]);

  const fetchReport = async () => {
    try {
      console.log("Đang gửi request với token:", token);
      const response = await axios.get(backendUrl + "/api/shipper/report", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setReport(response.data.report);
        setSalaryByMonth(response.data.report.salaryByMonth || []);
        setCancelReasons(response.data.report.cancelReasons || []);
        setDistrictStats(response.data.report.districtStats || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log("Lỗi khi gọi API:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/shipper/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setList(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const Card = ({ title, value, suffix = "", isCurrency = false }) => (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-gray-600">{title}</div>
      <div className="text-xl font-bold mt-2">
        {isCurrency
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value || 0)
          : `${value || 0} ${suffix}`}
      </div>
    </div>
  );

  const ChartContainer = ({ title, children }) => (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );

  useEffect(() => {
    fetchOrders();
    fetchReport();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className=" p-6 rounded-xl shadow-sm">
        <p className="font-bold text-2xl mb-8">THỐNG KÊ DOANH THU</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card title="Tổng doanh thu" value={report?.salary} isCurrency />
          <Card
            title="Số đơn thành công"
            value={report?.successCount}
            suffix="đơn"
          />
          <Card
            title="Số đơn thất bại"
            value={report?.failCount}
            suffix="đơn"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ChartContainer title="Lương theo tháng">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "column" },
                title: null,
                xAxis: {
                  categories: salaryByMonth.map((item) => item.month),
                  title: { text: "Tháng" },
                },
                yAxis: {
                  min: 0,
                  title: { text: "Lương (VNĐ)" },
                },
                series: [
                  {
                    name: "Lương",
                    data: salaryByMonth.map((item) => item.totalSalary),
                  },
                ],
                credits: { enabled: false },
              }}
            />
          </ChartContainer>

          <ChartContainer title="Tỷ lệ đơn giao thành công / thất bại">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "pie" },
                title: null,
                series: [
                  {
                    name: "Đơn hàng",
                    data: [
                      { name: "Thành công", y: report?.successOrders || 0 },
                      { name: "Thất bại", y: report?.failedOrders || 0 },
                    ],
                  },
                ],
                plotOptions: {
                  pie: {
                    innerSize: "50%",
                    dataLabels: {
                      enabled: true,
                      format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    },
                  },
                },
                tooltip: {
                  pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
                },
                credits: { enabled: false },
              }}
            />
          </ChartContainer>

          <ChartContainer title="Lý do hoàn hàng phổ biến">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "pie" },
                title: null,
                series: [
                  {
                    name: "Lý do",
                    data: cancelReasons.map((item) => ({
                      name: item._id,
                      y: item.count,
                    })),
                  },
                ],
                plotOptions: {
                  pie: {
                    innerSize: "50%",
                    dataLabels: {
                      enabled: true,
                      format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    },
                  },
                },
                tooltip: {
                  pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
                },
                credits: { enabled: false },
              }}
            />
          </ChartContainer>

          <ChartContainer title="Số đơn giao thành công theo quận">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: { type: "column" },
                title: null,
                xAxis: {
                  categories: districtStats.map((item) => item.district),
                  title: { text: "Quận" },
                },
                yAxis: {
                  min: 0,
                  title: { text: "Số đơn thành công" },
                  allowDecimals: false,
                },
                series: [
                  {
                    name: "Số đơn",
                    data: districtStats.map((item) => item.count),
                  },
                ],
                credits: { enabled: false },
              }}
            />
          </ChartContainer>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-xl shadow-sm mt-6">
        <p className="font-bold text-2xl mb-6">LỊCH SỬ GIAO HÀNG</p>

        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 py-2 px-4 border-b font-semibold text-sm text-gray-700">
          <span>MÃ ĐƠN</span>
          <span>NGÀY GIAO</span>
          <span>TRẠNG THÁI</span>
          <span>TỔNG TIỀN</span>
          <span>GHI CHÚ</span>
        </div>

        {list.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[2fr_1fr_1fr_1fr_2fr] gap-2 items-center py-2 px-4 border-b text-sm"
          >
            <p className="truncate">{item._id}</p>
            <p>{new Date(item.date).toLocaleDateString("vi-VN")}</p>
            <p>{item.status}</p>
            <p>{item.amount.toLocaleString("vi-VN")} ₫</p>
            <p className="truncate">{item.cancelReason || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Revenue;
