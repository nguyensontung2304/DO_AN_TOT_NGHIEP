import express from "express";

import {
  getMyRating,
  postRatingProduct,
  // getRatingProduct,
} from "../controller/ratings.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Lấy đánh giá của user hiện tại cho bài viết
router.get("/:id/me", verifyToken, getMyRating);

// Lấy tất cả đánh giá của bài viết
// router.get("/:id", verifyToken, getRatingProduct);

// Đánh giá bài viết
router.post("/:id", verifyToken, postRatingProduct);

export default router;
