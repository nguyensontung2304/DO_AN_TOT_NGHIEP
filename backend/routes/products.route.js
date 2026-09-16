import express from "express";

import {
  products,
  getProductDetail,
} from "../controller/products.controller.js";

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", products);

// Lấy chi tiết 1 sản phẩm
router.get("/:id", getProductDetail);

export default router;
