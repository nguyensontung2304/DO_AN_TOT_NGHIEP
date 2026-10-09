import express from "express";

import {
  getConversations,
  getConversationMessages,
} from "../controller/chat.controller.js";

import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// API chat dành riêng cho admin.
// Gửi/nhận tin nhắn realtime đi qua socket.io, ở đây chỉ lấy lịch sử và
// danh sách cuộc trò chuyện. verifyToken + checkAdmin phải đứng trước handler.

// Danh sách khách hàng đã từng chat, người nhắn gần nhất lên đầu
router.get("/conversations", verifyToken, checkAdmin, getConversations);

// Lịch sử chat với 1 khách hàng
router.get(
  "/conversations/:userId/messages",
  verifyToken,
  checkAdmin,
  getConversationMessages,
);

export default router;
