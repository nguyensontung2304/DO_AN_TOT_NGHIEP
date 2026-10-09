import express from "express";

import {
  createOrder,
  getOrdersByUserId,
  cancelOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controller/order.controller.js";

import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createOrder); // user tạo đơn

router.get("/user/:userId", verifyToken, getOrdersByUserId); // user xem đơn mình

router.put("/:id/cancel", verifyToken, cancelOrder); // user hủy đơn mình

router.get("/", verifyToken, checkAdmin, getAllOrders); // admin xem tất cả

router.get("/:id", verifyToken, checkAdmin, getOrderById); // admin xem chi tiết

router.put("/:id/status", verifyToken, checkAdmin, updateOrderStatus); // admin cập nhật trạng thái

export default router;
