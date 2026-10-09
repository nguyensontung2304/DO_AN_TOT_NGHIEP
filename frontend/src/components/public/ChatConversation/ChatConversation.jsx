import { useEffect, useRef, useState } from "react";

import "./chatConversation.scss";

// Khung chat dùng chung cho user (ChatBox) và admin (trang admin/Chat)
// - viewAsAdmin: true -> tin của admin nằm bên phải (tin của mình), false -> tin của user nằm bên phải
// - onSend(content): trả về Promise { success } hoặc { error }
const formatTime = (createdAt) =>
  new Date(createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });

function ChatConversation({
  messages,
  loading,
  viewAsAdmin,
  onSend,
  emptyText,
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

  // Có tin nhắn mới -> tự cuộn xuống cuối
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Gửi tin nhắn
  const handleSend = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || sending) {
      return;
    }

    setSending(true);

    try {
      const result = await onSend(trimmedContent);

      if (result?.error) {
        alert(result.error);
      } else {
        setContent("");
      }
    } catch {
      alert("Không gửi được tin nhắn, vui lòng thử lại");
    } finally {
      setSending(false);
    }
  };

  // Enter gửi, Shift + Enter xuống dòng
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-conversation">
      <div className="message-list" ref={listRef}>
        {loading && (
          <div className="loading">
            <span className="loading-spinner"></span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="empty">{emptyText}</div>
        )}

        {messages.map((message) => {
          const isMine = message.fromAdmin === viewAsAdmin;

          return (
            <div
              className={`message-row ${isMine ? "own" : "other"}`}
              key={message.id}
            >
              <div className="message-content">
                <div className="bubble">{message.content}</div>

                <div className="time">{formatTime(message.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="composer">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          maxLength={1000}
          disabled={sending}
        />

        <button
          type="button"
          className="send-button"
          onClick={handleSend}
          disabled={sending || !content.trim()}
          aria-label="Gửi tin nhắn"
        >
          {sending ? "..." : "➤"}
        </button>
      </div>
    </div>
  );
}

export default ChatConversation;
