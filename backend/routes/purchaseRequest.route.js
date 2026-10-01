import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllPurchaseRequests,
  updatePurchaseRequestStatus,
  createPurchaseRequest,
  deletePurchaseRequest,
} from "../controller/purchaseRequest.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllPurchaseRequests);

router.post("/", verifyToken, checkAdmin, createPurchaseRequest);

router.put("/:id/status", verifyToken, checkAdmin, updatePurchaseRequestStatus);

router.delete("/:id", verifyToken, checkAdmin, deletePurchaseRequest);

export default router;