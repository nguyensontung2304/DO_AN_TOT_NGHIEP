import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllDesignRequests,
  createDesignRequest,
  provideDesign,
} from "../controller/designRequest.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllDesignRequests);

router.post("/", verifyToken, checkAdmin, createDesignRequest);
156;

router.put("/:id/design", verifyToken, checkAdmin, provideDesign);

export default router;
