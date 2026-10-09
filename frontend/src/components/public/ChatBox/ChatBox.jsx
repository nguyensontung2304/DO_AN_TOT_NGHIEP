import { useEffect, useRef, useState } from "react";

import "./chatBox.scss";

import ChatConversation from "../ChatConversation/ChatConversation";
import useChatSocket from "../../../hooks/useChatSocket";
import { sendChatMessage } from "../../../api/socketApi";
import { getMyMessages } from "../../../api/chatAPi";

// Nút chat nổi ở góc phải màn hình, chỉ hiển thị khi user (không phải admin) đã đăng nhập

// (UserLayout quyết định có render component này hay không)
function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Số tin admin gửi tới trong lúc khung chat đang đóng
  const [unreadCount, setUnreadCount] = useState(0);

  // Dùng ref để callback socket luôn đọc trạng thái mở/đóng mới nhất
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Lấy lịch sử tin nhắn từ backend
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);

      try {
        const response = await getMyMessages();

        setMessages(
          Array.isArray(response) ? response : response.messages || [],
        );
      } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Nhận tin nhắn realtime từ Socket.IO
  useChatSocket((message) => {
    setMessages((prevMessages) => {
      // Tránh thêm trùng tin nhắn nếu đã có trong danh sách
      const isDuplicate = prevMessages.some((item) => item.id === message.id);

      if (isDuplicate) {
        return prevMessages;
      }

      return [...prevMessages, message];
    });

    if (message.fromAdmin && !isOpenRef.current) {
      setUnreadCount((count) => count + 1);
    }
  });

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = (content) => sendChatMessage({ content });

  if (!isOpen) {
    return (
      <button
        className="float-button"
        type="button"
        onClick={handleOpen}
        aria-label="Chat với shop"
      >
        <span className="chat-icon">💬</span>

        {unreadCount > 0 && (
          <span className="chat-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="panel">
      <div className="header">
        <span>Chat với Nội Thất Việt</span>

        <button
          type="button"
          className="close-button"
          onClick={handleClose}
          aria-label="Đóng khung chat"
        >
          ×
        </button>
      </div>

      <div className="body">
        <ChatConversation
          messages={messages}
          loading={loading}
          viewAsAdmin={false}
          onSend={handleSend}
          emptyText="Bạn cần hỗ trợ gì? Hãy nhắn cho shop nhé!"
        />
      </div>
    </div>
  );
}

export default ChatBox;
