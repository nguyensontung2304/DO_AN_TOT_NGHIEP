import { io } from "socket.io-client";

import { refreshAccessToken } from "./api";

// Chỉ giữ 1 kết nối socket cho cả app
let socket = null;

// Kết nối tới server socket.io (cùng địa chỉ với API)
export const connectSocket = () => {
  if (socket) {
    return socket;
  }

  socket = io(import.meta.env.VITE_API_URL, {
    // Truyền hàm thay vì object: mỗi lần kết nối (hoặc kết nối lại) đều lấy access token mới nhất
    auth: (callback) =>
      callback({ token: localStorage.getItem("accessToken") }),
  });

  // Server từ chối kết nối vì token hết hạn -> xin token mới rồi kết nối lại
  // (bị server từ chối thì socket.io không tự kết nối lại, phải gọi connect())
  socket.on("connect_error", async (error) => {
    if (error.message !== "UNAUTHORIZED") {
      return; // Lỗi mạng / server tắt: socket.io tự thử kết nối lại
    }

    try {
      await refreshAccessToken();
      socket?.connect();
    } catch {
      // Refresh token cũng hết hạn -> bỏ qua, các API khác sẽ tự chuyển về trang login
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

/**
 * Gửi tin nhắn chat
 * Event: "chat:send" - data: { content } (user) hoặc { content, userId } (admin)
 * Kết quả: { success: true } hoặc { error: 'message lỗi' }
 */
export const sendChatMessage = (data) => {
  return new Promise((resolve) => {
    // timeout: server không phản hồi trong 5 giây (mất mạng...) thì báo lỗi, không chờ mãi
    socket.timeout(5000).emit("chat:send", data, (timeoutError, response) => {
      if (timeoutError) {
        resolve({ error: "Không gửi được tin nhắn, vui lòng thử lại" });
      } else {
        resolve(response);
      }
    });
  });
};
