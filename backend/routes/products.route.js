import express from "express";

import {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/products.controller.js";

import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public — lấy danh sách và chi tiết sản phẩm
router.get("/", getProducts);
router.get("/:id", getProductDetail);

// Admin only — CRUD
router.post("/", verifyToken, checkAdmin, createProduct);
router.put("/:id", verifyToken, checkAdmin, updateProduct);
router.delete("/:id", verifyToken, checkAdmin, deleteProduct);

export default router;
