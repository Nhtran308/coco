import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../../../assets/assets";
const Footer = () => {
  return (
    <footer className="bg-white border-t pt-10 pb-6 mt-10 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Logo + mô tả */}
          <div>
            <img
              src={assets.head_logo_red}
              className="mb-4 w-32"
              alt="COCO Logo"
            />
            <p className="leading-relaxed text-gray-600">
              COCO mang đến sự lựa chọn tinh tế trong từng sản phẩm, kết hợp
              giữa phong cách hiện đại và chất lượng vượt trội, đồng hành cùng
              bạn mỗi ngày.
            </p>
          </div>

          <div>
            <p className="text-base font-semibold mb-4 text-gray-800">COCO</p>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="hover:text-[#567C8D] hover:underline transition"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-[#567C8D] hover:underline transition"
                >
                  Đơn hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#567C8D] hover:underline transition"
                >
                  Chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#567C8D] hover:underline transition"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <p className="text-base font-semibold mb-4 text-gray-800">
              LIÊN HỆ
            </p>
            <ul className="space-y-2">
              <li>📞 0868 298 374</li>
              <li>✉️ tranlongnhat.3008@gmail.com</li>
              <li>📍 85/2 Nguyễn Sơn, Phú Thạnh, Tân Phú, TP.HCM</li>
            </ul>
          </div>

          {/* Bản đồ */}
          <div>
            <p className="text-base font-semibold mb-4 text-gray-800">BẢN ĐỒ</p>
            <div className="w-full h-40 rounded-lg overflow-hidden shadow">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d582.6203616362278!2d106.62933961203183!3d10.781643646397587!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ea7fba872b9%3A0xb8a165e4092a7504!2zODUvMiBOZ3V54buFbiBTxqFuLCBQaMO6IFRo4bqhbmgsIFTDom4gUGjDuiwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1746854193729!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Cửa hàng COCO"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-gray-200 pt-5">
          <p className="text-center text-gray-500 text-xs">
            <strong className="text-gray-700">COCO</strong> © 2025 ALL RIGHTS
            RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
