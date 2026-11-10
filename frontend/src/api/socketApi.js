import { io } from "socket.io-client";
import { refreshAccessToken } from "./api";

// Chỉ giữ một kết nối socket cho cả ứng dụng
let socket = null;

// Ngăn nhiều lỗi UNAUTHORIZED cùng lúc gọi refresh token
let refreshingToken = false;

// Kết nối tới server Socket.IO
export const connectSocket = () => {
  if (socket) {
    // Nếu socket đã tồn tại nhưng chưa kết nối,
    // trả về socket hiện tại để tránh tạo kết nối mới.
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    autoConnect: false,

    // Mỗi lần kết nối lại đều lấy access token mới nhất
    auth: (callback) => {
      callback({
        token: localStorage.getItem("accessToken"),
      });
    },
  });

  socket.on("connect_error", async (error) => {
    if (error.message !== "UNAUTHORIZED") {
      // Lỗi mạng hoặc server: Socket.IO tự xử lý reconnect
      return;
    }

    // Tránh nhiều connect_error cùng refresh token
    if (refreshingToken) {
      return;
    }

    refreshingToken = true;

    try {
      await refreshAccessToken();

      // Kết nối lại sau khi refresh thành công
      if (socket && !socket.connected) {
        socket.connect();
      }
    } catch (refreshError) {
      // Không tiếp tục thử refresh vô hạn
      console.error("Không thể làm mới phiên đăng nhập:", refreshError);
    } finally {
      refreshingToken = false;
    }
  });

  socket.connect();

  return socket;
};

// Ngắt kết nối và xóa socket hiện tại
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  refreshingToken = false;
};

/**
 * Gửi tin nhắn chat
 * User: { content }
 * Admin: { content, userId }
 */
export const sendChatMessage = (data) => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve({
        error: "Kết nối chat chưa sẵn sàng, vui lòng thử lại",
      });
      return;
    }

    socket.timeout(5000).emit("chat:send", data, (timeoutError, response) => {
      if (timeoutError) {
        resolve({
          error: "Không gửi được tin nhắn, vui lòng thử lại",
        });
        return;
      }

      resolve(response);
    });
  });
};
