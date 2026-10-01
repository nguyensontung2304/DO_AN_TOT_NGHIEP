import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllProductionRequests,
  createProductionRequest,
  updateProductionRequestStatus,
  deleteProductionRequest,
} from "../controller/productionRequest.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllProductionRequests);

router.post("/", verifyToken, checkAdmin, createProductionRequest);

router.put(
  "/:id/status",
  verifyToken,
  checkAdmin,
  updateProductionRequestStatus,
);

router.delete("/:id", verifyToken, checkAdmin, deleteProductionRequest);

export default router;