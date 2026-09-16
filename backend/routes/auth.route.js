import express from "express";

import {
  register,
  login,
  getUserById,
  updateUserById,
  refreshToken,
  logout,
  getMyProfile,
} from "../controller/auth.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// gửi data user đăng ký
router.post("/register", register);

// gửi data user đăng nhập
router.post("/login", login);

// lấy data user đã login
router.get("/:id", getUserById);

// cập nhật thông tin user
router.put("/login/:id", updateUserById);

// refresh-token
router.post("/refresh-token", refreshToken);

// Các API dưới đây cần đăng nhập (gửi access token)
router.post("/logout", verifyToken, logout);
router.get("/profile", verifyToken, getMyProfile);

export default router;
