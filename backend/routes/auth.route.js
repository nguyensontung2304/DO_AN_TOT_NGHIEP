import express from "express";

import {
  register,
  login,
  updateMyProfile,
  refreshToken,
  logout,
  getMyProfile,
  changePassword,
  updateAvatar,
} from "../controller/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/uploadAvatar.middleware.js";

const router = express.Router();

// đăng ký
router.post("/register", register);

// đăng nhập
router.post("/login", login);

// refresh-token
router.post("/refresh-token", refreshToken);

// Các API dưới đây cần đăng nhập (gửi access token)
// logout
router.post("/logout", verifyToken, logout);

// Lấy thông tin profile của user hiện tại
router.get("/profile", verifyToken, getMyProfile);

// Đổi mật khẩu (phải đặt TRƯỚC /profile/:id để không bị shadow)
router.put("/profile/change-password", verifyToken, changePassword);

// Cập nhật thông tin profile của user hiện tại
router.put("/profile/:id", verifyToken, updateMyProfile);

// Cập nhật avatar (upload file)
router.patch(
  "/profile/avatar",
  verifyToken,
  upload.single("avatar"),
  updateAvatar,
);

export default router;
