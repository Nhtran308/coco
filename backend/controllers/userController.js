import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Tạo token
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Email không tồn tại" });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        success: false,
        message:
          "Tài khoản này là quản trị viên, vui lòng đăng nhập ở trang quản trị.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id, user.role);
      res.json({ success: true, token, role: user.role });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu không đúng" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Đã xảy ra lỗi server" });
  }
};

// Đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Tài khoản đã tồn tại" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Vui lòng nhập email hợp lệ",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Vui lòng đặt mật khẩu mạnh hơn",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      fullName,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id, user.role);

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

const userProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Thiếu token xác thực" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });
    }

    const userId = decoded.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Đảm bảo các trường không undefined
    const safeUser = {
      ...user._doc,
      address: user.address || {},
    };

    res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { fullName, address = {} } = req.body;

    // Tạo object update linh hoạt
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;

    if (Object.keys(address).length > 0) {
      updateFields.address = {
        name: address.name || "",
        phone: address.phone || "",
        houseNumber: address.houseNumber || "",
        ward: address.ward || "",
        district: address.district || "",
        province: address.province || "",
      };
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Cập nhật lỗi:", error.message);
    res.status(500).json({ success: false, message: "Cập nhật thất bại" });
  }
};

const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Thiếu token xác thực",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const userId = decoded.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới không khớp.",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại.",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi server.",
    });
  }
};

// Đăng nhập quản trị viên
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await userModel.findOne({ email, role: "admin" });

    if (!admin) {
      return res.json({
        success: false,
        message: "Bạn không có quyền truy cập hệ thống",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      const token = createToken(admin._id, admin.role);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Mật khẩu không đúng" });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Gửi yêu cầu reset mật khẩu
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Check if user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Nếu email tồn tại, chúng tôi sẽ gửi hướng dẫn qua email.",
      });
    }

    // Step 2: Create a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const resetPasswordExpire = Date.now() + 60 * 60 * 1000; // Token expires in 1 hour

    // Step 3: Save the reset token and expiration date to the user record
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Step 4: Set up the email transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER, // Store your email in an environment variable
        pass: process.env.EMAIL_PASS, // Store the password securely in an environment variable
      },
    });

    // Step 5: Create the reset password URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Step 6: Set up the email options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER, // Use the environment variable for your email
      subject: "Yêu cầu đặt lại mật khẩu",
      text: `Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.\n\n
Vui lòng click vào link dưới đây hoặc dán vào trình duyệt để hoàn tất:\n\n
${resetUrl}\n\n
Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.`,
    };

    // Step 7: Send the email
    await transporter.sendMail(mailOptions);

    // Step 8: Send success response
    res.json({
      success: true,
      message: "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    // Provide a more detailed error response for debugging
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi gửi email.",
      error: error.message, // Include error message for debugging
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params; // Lấy token từ URL
  const { password } = req.body; // Lấy mật khẩu từ body

  if (!token || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu token hoặc mật khẩu." });
  }

  try {
    // Mã hóa token (nếu cần) trước khi so sánh
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    // Hash mật khẩu trước khi lưu vào database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng lặp salt (bạn có thể điều chỉnh)

    // Lưu mật khẩu đã được hash vào database
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Mật khẩu đã được đổi thành công." });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra khi đặt lại mật khẩu." });
  }
};

const subscribeVoucher = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp email.",
    });
  }

  try {
    // Kiểm tra xem email đã đăng ký chưa (từ DB)
    const existingUser = await userModel.findOne({ email });

    if (existingUser && existingUser.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đăng ký nhận ưu đãi trước đó.",
      });
    }

    // Cập nhật trạng thái isSubscribed cho người dùng
    if (!existingUser) {
      // Nếu người dùng chưa tồn tại, bạn có thể tạo mới người dùng
      await userModel.create({ email, isSubscribed: true });
    } else {
      // Nếu người dùng đã tồn tại nhưng chưa đăng ký, cập nhật trường isSubscribed
      existingUser.isSubscribed = true;
      await existingUser.save();
    }

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const voucherCode = "WELCOME10"; // Mã giảm giá mặc định

    // Soạn email
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Cảm ơn bạn đã đăng ký! Nhận mã giảm giá ngay 🎉",
      text: `Xin chào,\n\n
Cảm ơn bạn đã đăng ký nhận tin từ chúng tôi!\n
Dưới đây là mã giảm giá 10% cho đơn hàng đầu tiên của bạn:\n\n
Mã giảm giá: ${voucherCode}\n\n
Hãy nhập mã này khi thanh toán để nhận ưu đãi.\n
Trân trọng,\nĐội ngũ hỗ trợ`,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    // Trả về kết quả thành công
    res.json({
      success: true,
      message: "Chúng tôi đã gửi mã giảm giá tới email của bạn!",
    });
  } catch (error) {
    console.error("Lỗi gửi voucher:", error.message);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi gửi mã giảm giá.",
    });
  }
};

const checkUserSubcribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng cung cấp email.",
    });
  }

  try {
    // Tìm kiếm người dùng trong cơ sở dữ liệu
    const user = await userModel.findOne({ email });

    // Kiểm tra nếu người dùng không tồn tại
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại.",
      });
    }

    // Kiểm tra trạng thái đăng ký
    if (user.isSubscribed) {
      return res.json({
        success: true,
        message: "Người dùng đã đăng ký nhận ưu đãi.",
      });
    } else {
      return res.json({
        success: true,
        message: "Người dùng chưa đăng ký nhận ưu đãi.",
      });
    }
  } catch (error) {
    console.error("Lỗi kiểm tra đăng ký:", error.message);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi kiểm tra đăng ký.",
    });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  userProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  subscribeVoucher,
  checkUserSubcribe,
  changePassword,
};
