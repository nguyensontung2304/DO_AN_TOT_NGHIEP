import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import models from "../models/index.js";
import { formatUser } from "../utils/format.js";

const { User } = models;

// Các controller dưới đây không cần try/catch:
// Express 5 tự chuyển lỗi sang errorHandler (middlewares/error.middleware.js)

// ====================== AccessToken ======================
// Tạo access token (sống ngắn) - dùng để gọi các API cần đăng nhập
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
  );
}
// console.log("=======> generateAccessToken:", generateAccessToken); // Log hàm generateAccessToken để kiểm tra xem nó có được định nghĩa đúng không

// ====================== RefreshToken ======================
// Tạo refresh token (sống dài) - chỉ dùng để xin access token mới
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
}
// console.log("=======> generateRefreshToken:", generateRefreshToken); // Log hàm generateRefreshToken để kiểm tra xem nó có được định nghĩa đúng không

// ====================== register ======================
// POST /register - đăng ký tài khoản, body: { name, email, password }
export async function register(req, res) {
  const { name, email, password } = req.body;
  console.log("=======> Register request body:", req.body); // Log name, email, password gửi lên từ frontend

  // Không cho đăng ký trùng email
  const existUser = await User.findOne({ where: { email: email } });
  // console.log("=======> Existing user:", existUser); // Log thông tin user đã tồn tại (nếu có)

  // Nếu đã tồn tại user với email này, trả về lỗi
  if (existUser) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }

  // Mã hóa mật khẩu trước khi lưu vào database
  const hashedPassword = await bcrypt.hash(password, 10);
  // console.log("=======> Password:", password); // Log mật khẩu chưa được mã hóa
  // console.log("=======> Hashed password:", hashedPassword); // Log mật khẩu đã được mã hóa

  const newUser = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    role: "user", // Tài khoản đăng ký luôn là user, admin được set trực tiếp trong DB
  });
  // console.log("=======> NewUser:", newUser); // Log thông tin user vừa tạo

  res.status(201).json(formatUser(newUser));
}

// ====================== login ======================
// POST /login - đăng nhập, body: { email, password }
export async function login(req, res) {
  const { email, password } = req.body;
  console.log("=======> Login request body:", req.body); // Log email, password gửi lên từ frontend

  // Tìm user trong database theo email
  const matchUser = await User.findOne({ where: { email: email } });
  console.log("=======> Matched user:", matchUser);

  // Nếu không tìm thấy email user, trả về lỗi
  if (!matchUser) {
    return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  // So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong database
  const isMatchPassword = await bcrypt.compare(password, matchUser.password);
  console.log("=======> password:", password); // Log mật khẩu người dùng nhập
  console.log("=======> matchUser.password:", matchUser.password); // Log mật khẩu đã mã hóa trong database
  console.log("=======> Password match:", isMatchPassword); // Log kết quả so sánh mật khẩu

  // Nếu mật khẩu không khớp, trả về lỗi
  if (!isMatchPassword) {
    return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
  }

  // Nếu email và mật khẩu đúng, tạo access token và refresh token
  const accessToken = generateAccessToken(matchUser);
  console.log("=======> Access token:", accessToken); // Log access token
  const refreshToken = generateRefreshToken(matchUser);
  console.log("=======> Refresh token:", refreshToken); // Log refresh token

  // Lưu refresh token vào DB để sau này kiểm tra khi cấp lại access token
  await matchUser.update({ refresh_token: refreshToken });
  console.log("=======> Matched user sau khi đã lưu refresh token:", matchUser);

  // Trả về access token, refresh token và thông tin user (không có password)
  res.status(200).json({
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: formatUser(matchUser),
  });
}

// ====================== logout ======================
// POST /logout - đăng xuất (cần token): xóa refresh token trong DB
export async function logout(req, res) {
  // console.log("=======> User ID from token:", req.user.id); // Log user ID từ token

  await User.update({ refresh_token: null }, { where: { id: req.user.id } });
  // console.log("=======> User logout, refresh token xóa khỏi DB"); // Log thông báo đã xóa refresh token trong DB

  res.status(200).json({ message: "Đăng xuất thành công" });
}

// ====================== refreshToken ======================
// POST /refresh-token - cấp lại access token, body: { refreshToken }
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  // console.log("=======> Refresh token request body:", req.body); // Log Refresh token gửi lên từ frontend

  // Nếu không có refresh token trong request body, trả về lỗi
  if (!refreshToken) {
    return res.status(401).json({ message: "Không có refresh token" });
  }

  // Kiểm tra refresh token còn hạn và đúng chữ ký không.
  // Ở đây vẫn cần try/catch vì token sai là chuyện bình thường, phải trả về 401
  // thay vì để thành lỗi server
  let decoded;
  try {
    // Giải mã refresh token để lấy thông tin user
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // console.log("=======> Decoded refresh token:", decoded); // Log thông tin giải mã từ refresh token
  } catch (error) {
    // console.error("=======> Refresh token verification error:", error); // Log lỗi khi verify refresh token
    return res
      .status(401)
      .json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }

  // Refresh token phải trùng với token đang lưu trong DB (đã logout thì không dùng được nữa)
  const matchUser = await User.findByPk(decoded.id);
  // console.log("=======> Matched user from DB:", matchUser); // Log thông tin user tìm thấy trong DB

  // Nếu không tìm thấy user hoặc refresh token không trùng với token trong DB, trả về lỗi
  if (!matchUser || matchUser.refresh_token !== refreshToken) {
    return res.status(401).json({ message: "Refresh token không hợp lệ" });
  }

  // Nếu refresh token hợp lệ, tạo access token mới và trả về cho client
  const newAccessToken = generateAccessToken(matchUser);
  // console.log("=======> New access token:", newAccessToken); // Log access token mới được cấp

  res.status(200).json({ accessToken: newAccessToken });
}

// ====================== MyProfile ======================
// GET /profile - lấy thông tin user đang đăng nhập (cần token)
export async function getMyProfile(req, res) {
  const result = await User.findByPk(req.user.id);
  if (!result) {
    return res.status(404).json({ message: "Không tìm thấy user" });
  }

  res.status(200).json(formatUser(result));
}

// ====================== Cập nhật USER theo id ======================
export const updateMyProfile = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  console.log(id);
  console.log(name);
  console.log(phone);
  console.log(address);

  // Tìm user theo id
  const user = await User.findByPk(id);

  // Không tìm thấy user
  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy user",
    });
  }

  // Cập nhật thông tin user
  await user.update({
    name,
    phone,
    address,
  });

  // Trả dữ liệu user sau khi cập nhật
  return res.status(200).json({
    message: "Cập nhật thông tin thành công",
    user: formatUser(user),
  });
};

// ====================== changePassword ======================
// PUT /change-password - đổi mật khẩu (cần token), body: { currentPassword, newPassword }
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });
  }

  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed });

  res.status(200).json({ message: "Đổi mật khẩu thành công" });
}

// ====================== updateAvatar ======================
// PATCH /profile/avatar - đổi avatar (cần token)
// Body dạng multipart/form-data, field ảnh tên là "avatar"
export async function updateAvatar(req, res) {
  console.log("File nhận được:", req.file);
  console.log("User ID:", req.user.id);

  if (!req.file) {
    return res.status(400).json({ message: "Vui lòng chọn ảnh" });
  }

  const user = await User.findByPk(req.user.id);

  console.log("Avatar trước khi cập nhật:", user?.avatar);

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy user" });
  }

  const result = await user.update({
    avatar: `/uploads/${req.file.filename}`,
  });

  console.log("Avatar sau khi cập nhật:", result.avatar);

  res.status(200).json(formatUser(result));
}
