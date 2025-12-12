import { assets } from "../assets/assets";
import {
  FaStore,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebook,
  FaCommentDots,
} from "react-icons/fa";
import Title from "../components/user/ui/Title";

const Contact = () => {
  return (
    <div className="px-4 md:px-12 lg:px-20 xl:px-32 py-8">
      <div className="text-2xl text-center pt-8">
        <Title text1={"LIÊN HỆ"} text2={"COCO®"} />
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-16 items-center mb-28">
        <img
          className="w-full md:max-w-[480px] rounded-xl shadow-md"
          src={assets.contact_img}
          alt="contact"
        />
        <div className="flex flex-col justify-center gap-6 max-w-xl text-gray-600">
          <div className="flex items-start gap-3">
            <FaStore className="text-teal-700 text-xl mt-1" />
            <div>
              <p className="font-semibold text-lg text-gray-700 mb-1">
                Địa chỉ
              </p>
              <p className="text-gray-500">
                85/2 Nguyễn Sơn, Phú Thạnh, Tân Phú, TP.HCM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaPhoneAlt className="text-teal-700 text-xl mt-1" />
            <div>
              <p className="font-semibold text-lg text-gray-700 mb-1">
                Hotline
              </p>
              <p className="text-gray-500">0868 298 374</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaEnvelope className="text-teal-700 text-xl mt-1" />
            <div>
              <p className="font-semibold text-lg text-gray-700 mb-1">
                Email CSKH
              </p>
              <p className="text-gray-500">tranlongnhat.3008@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaFacebook className="text-teal-700 text-xl mt-1" />
            <div>
              <p className="font-semibold text-lg text-gray-700 mb-1">
                Facebook
              </p>
              <a
                href="https://www.facebook.com/Nhattran.30/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                facebook.com/Nhattran.30/
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaCommentDots className="text-teal-700 text-xl mt-1" />
            <div>
              <p className="font-semibold text-lg text-gray-700 mb-1">Zalo</p>
              <p className="text-gray-500">0868 298 374</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
