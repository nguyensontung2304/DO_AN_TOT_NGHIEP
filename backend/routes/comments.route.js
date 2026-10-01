import express from "express";
import {
  getCommentProduct,
  postCommentProduct,
  updateCommentProduct,
  deleteCommentProduct,
} from "../controller/comments.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Lấy tất cả bình luận của bài viết
router.get("/product/:productId", getCommentProduct);

// Thêm bình luận cho bài viết
router.post("/product/:productId", verifyToken, postCommentProduct);

// Sửa bình luận cho bài viết
router.put("/:commentId", verifyToken, updateCommentProduct);

// Xóa bình luận cho bài viết
router.delete("/:commentId", verifyToken, deleteCommentProduct);

export default router;
