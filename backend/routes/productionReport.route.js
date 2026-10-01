import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllProductionReports,
  createProductionReport,
  updateProductionReportStatus,
} from "../controller/productionReport.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllProductionReports);

router.post("/", verifyToken, checkAdmin, createProductionReport);
router.put("/:id/status", verifyToken, checkAdmin, updateProductionReportStatus);

export default router;
