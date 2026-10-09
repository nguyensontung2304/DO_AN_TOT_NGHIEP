import express from "express";

import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/products.controller.js";

import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import uploadImageProduct from "../middlewares/uploadImageProduct.middleware.js";

const router = express.Router();

// ====================== PUBLIC ======================
// Lấy danh sách sản phẩm
router.get("/", getProducts);

// Lấy chi tiết sản phẩm
router.get("/:id", getProductDetail);

// ====================== ADMIN ======================
// Thêm sản phẩm + upload ảnh
router.post(
  "/",
  verifyToken,
  checkAdmin,
  uploadImageProduct.single("image"),
  createProduct,
);

// Cập nhật sản phẩm + có thể upload ảnh mới
router.put(
  "/:id",
  verifyToken,
  checkAdmin,
  uploadImageProduct.single("image"),
  updateProduct,
);

// Xóa sản phẩm
router.delete("/:id", verifyToken, checkAdmin, deleteProduct);

export default router;
