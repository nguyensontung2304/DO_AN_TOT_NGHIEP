import "dotenv/config"; // Nạp biến môi trường từ file .env (phải import đầu tiên)
import path from "node:path";
import http from "http";
import express from "express";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import productsRoute from "./routes/products.route.js";
import categoryRoute from "./routes/category.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import materialRoute from "./routes/material.route.js";
import productionRequestRoute from "./routes/productionRequest.route.js";
import purchaseRequestRoute from "./routes/purchaseRequest.route.js";
import handoverOrderRoute from "./routes/handoverOrder.route.js";
import designRequestRoute from "./routes/designRequest.route.js";
import productionReportRoute from "./routes/productionReport.route.js";
import finishedGoodRoute from "./routes/finishedGood.route.js";
import ratingRoute from "./routes/ratings.route.js";
import commentRoute from "./routes/comments.route.js";
import chatRoute from "./routes/chat.route.js";
import adminChatRoute from "./routes/adminChat.route.js";
import { initSocket } from "./socket/socket.js";
import locationRoute from "./routes/location.route.js";
import addressRoute from "./routes/address.route.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());

app.use(express.json());

// Cho phép truy cập file đã upload: http://localhost:5000/uploads/<filename>
app.use("/uploads", express.static(path.resolve("uploads")));

// ====================== AUTH ======================
app.use("/auth", authRoute);

// ====================== PRODUCTS ======================
app.use("/products", productsRoute);

// ====================== CATEGORIES ======================
app.use("/categories", categoryRoute);

// ====================== CARTS ======================
app.use("/cart", cartRoute);

// ====================== ORDERS ======================
app.use("/orders", orderRoute);

// ====================== ERP (quản lý sản xuất) ======================
// ====================== MATERIALS ======================
app.use("/materials", materialRoute);

// ====================== PRODUCTION REQUEST ======================
app.use("/production-requests", productionRequestRoute);

// ====================== PURCHASE REQUEST ======================
app.use("/purchase-requests", purchaseRequestRoute);

// ====================== HANDOVER ORDER ======================
app.use("/handover-orders", handoverOrderRoute);

app.use("/design-requests", designRequestRoute);

// ====================== PRODUCTION REPORT ======================
app.use("/production-reports", productionReportRoute);

// ====================== FINISHED GOOD ======================
app.use("/finished-goods", finishedGoodRoute);

// ====================== RATINGS ======================
app.use("/ratings", ratingRoute);

// ====================== COMMENTS ======================
app.use("/comments", commentRoute);

app.use("/chat", chatRoute);

// Chat dành cho admin (danh sách cuộc trò chuyện, lịch sử từng khách)
app.use("/admin/chat", adminChatRoute);

// ====================== Tỉnh/thành và phường/xã theo địa danh mới ======================
app.use("/locations", locationRoute);

app.use("/profile/address", addressRoute); // Sổ địa chỉ riêng của user

// Middleware xử lý lỗi phải nằm sau routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Tự tạo HTTP server từ app Express rồi gắn socket.io vào -> API và socket dùng chung 1 port
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
