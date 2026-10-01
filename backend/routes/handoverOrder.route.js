import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllHandoverOrders,
  createHandoverOrder,
  updateHandoverOrderStatus,
  deleteHandoverOrder,
} from "../controller/handoverOrder.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllHandoverOrders);

router.post("/", verifyToken, checkAdmin, createHandoverOrder);

router.put("/:id/status", verifyToken, checkAdmin, updateHandoverOrderStatus);

router.delete("/:id", verifyToken, checkAdmin, deleteHandoverOrder);

export default router;