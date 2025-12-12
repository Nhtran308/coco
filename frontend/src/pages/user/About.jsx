import { assets } from "../../assets/assets";
import { Title } from "../../components/user";

const About = () => {
  return (
    <div className="px-4 md:px-12 lg:px-20 xl:px-32 py-8">
      <div className="text-2xl text-center pt-8">
        <Title text1="CÂU CHUYỆN CỦA" text2="COCO®" />
      </div>

      <div className="my-12 flex flex-col md:flex-row gap-10 items-center">
        <img
          className="w-full md:max-w-md rounded-xl shadow-md object-cover"
          src={assets.about_img}
          alt="About us"
        />
        <div className="flex flex-col justify-center gap-6 text-gray-600 text-justify">
          <p>
            Ra mắt Sài Gòn vào năm 2025, Coco® không chỉ là một local brand, mà
            còn là biểu tượng của sự sáng tạo và đam mê. Được sáng lập bởi một
            nhóm các nhà thiết kế trẻ tuổi, đầy nhiệt huyết, Coco® mang trong
            mình tinh thần của những con người yêu sống cuộc sống về đêm.
          </p>
          <p>
            Coco® không chỉ tạo ra thời trang, mà còn tạo ra câu chuyện, một
            phong cách sống và cá tính 💙 Từng bước phát triển, Coco® giờ đã là
            cái tên quen thuộc trong lòng giới trẻ Việt, bây giờ, bọn mình quyết
            tâm lan tỏa nhiệt huyết về đêm đến mọi nơi ở châu Á.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mt-4">SỨ MỆNH</h3>
          <p>
            Sứ mệnh của Coco® là làm nổi bật vẻ đẹp của màn đêm qua ngôn ngữ
            thời trang. Chúng mình tôn vinh những bạn trẻ coi màn đêm là sân
            chơi của riêng mình. Sự cống hiến không ngừng, sáng tạo, xuất sắc,
            và đổi mới đặt chúng mình vào vị trí tiên phong trong mảng thời
            trang Streetwear. Mỗi sản phẩm chúng mình tạo ra là lời mời gọi bạn
            tự tin toả sáng, thể hiện phong cách độc đáo của mình, tự do dưới
            bầu trời đêm💫
          </p>
        </div>
      </div>

      <div className="text-2xl text-center py-6">
        <Title text1="TẠI SAO LÀ" text2="COCO®" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            title: "Đảm Bảo Chất Lượng",
            desc: "Cam kết mang đến cho khách hàng những sản phẩm chất lượng cao với thiết kế đẹp mắt, chất liệu bền bỉ và đúng mô tả.",
          },
          {
            title: "Tiện Lợi",
            desc: "Cửa hàng thời trang điện tử Coco luôn đặt sự tiện lợi của khách hàng lên hàng đầu bằng cách tối ưu hóa trải nghiệm mua sắm trực tuyến.",
          },
          {
            title: "Chăm Sóc Khách Hàng",
            desc: "Đội ngũ hỗ trợ chuyên nghiệp, tận tâm, sẵn sàng giải đáp mọi thắc mắc và xử lý yêu cầu nhanh chóng qua nhiều kênh như hotline, email và chat trực tuyến.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="border rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition duration-300"
          >
            <h4 className="font-semibold text-lg mb-3">
              {item.title.toLocaleUpperCase()}
            </h4>
            <p className="text-gray-600 text-justify">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
