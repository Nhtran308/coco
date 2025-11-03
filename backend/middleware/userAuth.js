import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("Token không tồn tại trong header");
    return res.json({ success: false, message: "Không thể xác minh" });
  }
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token hợp lệ, userId:", token_decode.id);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log("Lỗi khi xác minh token:", error);
    res.json({
      success: false,
      message: error.message || "Lỗi xác minh token",
    });
  }
};

export default authUser;
