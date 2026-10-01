import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllMaterials,
  createMaterial,
  updateMaterialStock,
  updateMaterial,
  deleteMaterial,
} from "../controller/material.controller.js";

const router = express.Router();

// Chỉ admin mới được đọc danh sách vật tư ERP
router.get("/", verifyToken, checkAdmin, getAllMaterials);

router.post("/", verifyToken, checkAdmin, createMaterial);

// Cộng/trừ tồn kho
router.put("/:id/stock", verifyToken, checkAdmin, updateMaterialStock);

// Sửa thông tin vật tư
router.put("/:id", verifyToken, checkAdmin, updateMaterial);

// Xoá vật tư
router.delete("/:id", verifyToken, checkAdmin, deleteMaterial);

export default router;