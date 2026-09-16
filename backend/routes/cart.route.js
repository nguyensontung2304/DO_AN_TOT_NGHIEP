import express from "express";

import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
} from "../controller/cart.controller.js";

const router = express.Router();

// Lấy giỏ hàng của user
router.get("/:userId", getCart);

// Thêm sản phẩm
router.post("/", addToCart);

// Cập nhật số lượng
router.put("/", updateCartQty);

// Xóa sản phẩm
router.delete("/:userId/:productId", removeFromCart);

export default router;
