import jwt from "jsonwebtoken";

const shipperAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token không có hoặc không hợp lệ" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    if (token_decode.role !== "shipper") {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    req.user = token_decode;

    next();
  } catch (error) {
    console.error("Token validation error:", error);
    return res
      .status(400)
      .json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

export default shipperAuth;
