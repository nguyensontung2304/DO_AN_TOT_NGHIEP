import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getCategories,
  // createCategory,
  // updateCategory,
  // deleteCategory,
} from "../controller/category.controller.js";

const router = express.Router();

// ====================== PUBLIC ======================
// Lấy danh sách danh mục (dùng cho filter, footer, load select admin)
router.get("/", getCategories);

// ====================== ADMIN ======================
// // Thêm danh mục
// router.post("/", verifyToken, checkAdmin, createCategory);

// // Sửa danh mục
// router.put("/:id", verifyToken, checkAdmin, updateCategory);

// // Xóa danh mục
// router.delete("/:id", verifyToken, checkAdmin, deleteCategory);

export default router;
