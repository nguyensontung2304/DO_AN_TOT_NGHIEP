// import pool from "../config/db.js";

// // ====================== REGISTER ======================
// export const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     // Kiểm tra dữ liệu
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         message: "Vui lòng nhập đầy đủ thông tin",
//       });
//     }

//     // Kiểm tra email đã tồn tại
//     const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
//       email,
//     ]);

//     if (checkUser.rows.length > 0) {
//       return res.status(400).json({
//         message: "Email đã tồn tại",
//       });
//     }

//     // Thêm user vào database
//     const result = await pool.query(
//       `
//         INSERT INTO users (name, email, password)
//         VALUES ($1, $2, $3)
//         RETURNING id, name, email
//       `,

//       [name, email, password],
//     );

//     const newUser = result.rows[0];

//     return res.status(201).json({
//       message: "Đăng ký thành công",
//       user: newUser,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// // ====================== LOGIN ======================
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Tìm user trong database
//     const result = await pool.query(
//       "SELECT id, name, phone, address, email, password FROM users WHERE email = $1",
//       [email],
//     );

//     // Không tìm thấy email
//     if (result.rows.length === 0) {
//       return res.status(401).json({
//         message: "Email hoặc mật khẩu không đúng",
//       });
//     }

//     const user = result.rows[0];

//     // Kiểm tra password
//     if (user.password !== password) {
//       return res.status(401).json({
//         message: "Email hoặc mật khẩu không đúng",
//       });
//     }

//     // Không trả password về frontend
//     const userLogin = {
//       id: user.id,
//       name: user.name,
//       phone: user.phone,
//       address: user.address,
//       email: user.email,
//     };

//     return res.status(200).json({
//       message: "Đăng nhập thành công",
//       user: userLogin,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// // ====================== Lấy USER theo id ======================
// export const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Tìm user trong database
//     const result = await pool.query(
//       `
//         SELECT *
//         FROM users
//         WHERE id = $1
//       `,
//       [id],
//     );

//     // Không tìm thấy user
//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Không tìm thấy user",
//       });
//     }

//     // Trả user về frontend
//     return res.status(200).json({
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// // ====================== Cập nhật USER theo id ======================
// export const updateUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, phone, address } = req.body;

//     const result = await pool.query(
//       `
//         UPDATE users
//         SET name = $1, phone = $2, address = $3
//         WHERE id = $4
//         RETURNING id, name, phone, address, email
//       `,
//       [name, phone, address, id],
//     );

//     console.log(result);

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Không tìm thấy user",
//       });
//     }

//     return res.status(200).json({
//       message: "Cập nhật thông tin thành công",
//       user: result.rows[0],
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Lỗi server",
//     });
//   }
// };

// ========================================

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import models from "../models/index.js";

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
console.log("=======> generateAccessToken:", generateAccessToken); // Log hàm generateAccessToken để kiểm tra xem nó có được định nghĩa đúng không

// ====================== RefreshToken ======================
// Tạo refresh token (sống dài) - chỉ dùng để xin access token mới
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
}
console.log("=======> generateRefreshToken:", generateRefreshToken); // Log hàm generateRefreshToken để kiểm tra xem nó có được định nghĩa đúng không

// ====================== formatUser ======================
// Chuyển dữ liệu user về dạng trả cho frontend (không có password, refresh_token)
function formatUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// ====================== register ======================
// POST /register - đăng ký tài khoản, body: { fullName, email, password }
export async function register(req, res) {
  const { fullName, email, password } = req.body;
  console.log("=======> Register request body:", req.body); // Log fullName, email, password gửi lên từ frontend

  // Không cho đăng ký trùng email
  const existUser = await User.findOne({ where: { email: email } });
  console.log("=======> Existing user:", existUser); // Log thông tin user đã tồn tại (nếu có)

  // Nếu đã tồn tại user với email này, trả về lỗi
  if (existUser) {
    return res.status(400).json({ message: "Email đã tồn tại" });
  }

  // Mã hóa mật khẩu trước khi lưu vào database
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("=======> Password:", password); // Log mật khẩu chưa được mã hóa
  console.log("=======> Hashed password:", hashedPassword); // Log mật khẩu đã được mã hóa

  const newUser = await User.create({
    name: fullName,
    email: email,
    password: hashedPassword,
    role: "user", // Tài khoản đăng ký luôn là user, admin được set trực tiếp trong DB
  });
  console.log("=======> NewUser:", newUser); // Log thông tin user vừa tạo

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

// ====================== Lấy USER theo id ======================
export const getUserById = async (req, res) => {
  const { id } = req.params;

  // Tìm user theo id
  const user = await User.findByPk(id);

  // Không tìm thấy user
  if (!user) {
    return res.status(404).json({
      message: "Không tìm thấy user",
    });
  }

  // Trả user về frontend
  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  });
};

// ====================== Cập nhật USER theo id ======================
export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

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
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    },
  });
};

// ====================== refreshToken ======================
// POST /refresh-token - cấp lại access token, body: { refreshToken }
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  console.log("=======> Refresh token request body:", req.body); // Log Refresh token gửi lên từ frontend

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
    console.log("=======> Decoded refresh token:", decoded); // Log thông tin giải mã từ refresh token
  } catch (error) {
    console.error("=======> Refresh token verification error:", error); // Log lỗi khi verify refresh token
    return res
      .status(401)
      .json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
  }

  // Refresh token phải trùng với token đang lưu trong DB (đã logout thì không dùng được nữa)
  const matchUser = await User.findByPk(decoded.id);
  console.log("=======> Matched user from DB:", matchUser); // Log thông tin user tìm thấy trong DB

  // Nếu không tìm thấy user hoặc refresh token không trùng với token trong DB, trả về lỗi
  if (!matchUser || matchUser.refresh_token !== refreshToken) {
    return res.status(401).json({ message: "Refresh token không hợp lệ" });
  }

  // Nếu refresh token hợp lệ, tạo access token mới và trả về cho client
  const newAccessToken = generateAccessToken(matchUser);
  console.log("=======> New access token:", newAccessToken); // Log access token mới được cấp

  res.status(200).json({ accessToken: newAccessToken });
}

// ====================== logout ======================
// POST /logout - đăng xuất (cần token): xóa refresh token trong DB
export async function logout(req, res) {
  console.log("=======> User ID from token:", req.user.id); // Log user ID từ token

  await User.update({ refresh_token: null }, { where: { id: req.user.id } });
  console.log("=======> User logout, refresh token xóa khỏi DB"); // Log thông báo đã xóa refresh token trong DB

  res.status(200).json({ message: "Đăng xuất thành công" });
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
