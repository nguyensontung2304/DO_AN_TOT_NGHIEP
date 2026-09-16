import "dotenv/config"; // Nạp biến môi trường từ file .env (phải import đầu tiên)
// import path from "node:path";
import express from "express";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import productsRoute from "./routes/products.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.json());

// ====================== AUTH ======================
app.use("/auth", authRoute);

// ====================== PRODUCTS ======================
app.use("/products", productsRoute);

// ====================== CARTS ======================
app.use("/cart", cartRoute);

// ====================== ORDERS ======================
app.use("/orders", orderRoute);

// Middleware xử lý lỗi phải nằm sau routes
app.use(errorHandler);

app.listen(5000, () => {
  console.log("Server đang chạy");
});
