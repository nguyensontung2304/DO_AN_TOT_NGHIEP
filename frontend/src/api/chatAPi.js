import api from "./api";

// Các API dưới đây chỉ để lấy lịch sử chat.
// Gửi tin nhắn và nhận tin nhắn mới đi qua socket.io (services/socket.js)

/**
 * Lịch sử chat của user đang đăng nhập với shop
 * API: GET /chat/messages
 * Kết quả: [{ id, userId, senderId, fromAdmin, content, createdAt }]
 */
export const getMyMessages = async () => {
  const response = await api.get("/chat/messages");
  return response.data;
};

/**
 * (Admin) Danh sách user đã từng chat, người nhắn gần nhất lên đầu
 * API: GET /admin/chat/conversations
 * Kết quả: [{ user: { id, name, email, avatar }, lastMessage: { content, fromAdmin, createdAt, ... } }]
 */
export const getConversationList = async () => {
  const response = await api.get("/admin/chat/conversations");
  return response.data;
};

/**
 * (Admin) Lịch sử chat với 1 user
 * API: GET /admin/chat/conversations/:userId/messages
 */
export const getConversationMessages = async (userId) => {
  const response = await api.get(
    `/admin/chat/conversations/${userId}/messages`,
  );
  return response.data;
};
