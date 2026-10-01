import express from "express";
import { verifyToken, checkAdmin } from "../middlewares/auth.middleware.js";
import {
  getAllFinishedGoods,
  createFinishedGood,
  updateFinishedGood,
  deleteFinishedGood,
} from "../controller/finishedGood.controller.js";

const router = express.Router();

router.get("/", verifyToken, checkAdmin, getAllFinishedGoods);

router.post("/", verifyToken, checkAdmin, createFinishedGood);

router.put("/:id", verifyToken, checkAdmin, updateFinishedGood);

router.delete("/:id", verifyToken, checkAdmin, deleteFinishedGood);

export default router;