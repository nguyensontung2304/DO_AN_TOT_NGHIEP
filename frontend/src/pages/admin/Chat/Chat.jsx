import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ChatConversation from "../../../components/public/ChatConversation/ChatConversation";
import { sendChatMessage } from "../../../api/socketApi";
import {
  getConversationList,
  getConversationMessages,
} from "../../../api/chatAPi";
import {
  isConversationUnread,
  markConversationRead,
} from "../../../utils/adminChatReadState";
import "./chat.scss";

const formatTime = (createdAt) => {
  if (!createdAt) return "";

  const date = new Date(createdAt);
  const today = new Date();

  const isToday = date.toDateString() === today.toDateString();

  return isToday
    ? date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
};

const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "?";

const getUnreadUserIds = (conversationList) =>
  conversationList.filter(isConversationUnread).map(({ user }) => user.id);

function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  // true ngay từ đầu để khung chat hiện vòng quay ngay khi vừa vào trang
  const [conversationLoading, setConversationLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [unreadUserIds, setUnreadUserIds] = useState([]);

  // Dùng ref để callback socket luôn lấy được dữ liệu mới nhất.
  const selectedUserIdRef = useRef(selectedUserId);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Lấy lại danh sách cuộc trò chuyện (dùng khi có khách nhắn lần đầu).
  const fetchConversations = async () => {
    try {
      setConversationLoading(true);

      const data = await getConversationList();
      setConversations(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách cuộc trò chuyện:", error);
    } finally {
      setConversationLoading(false);
    }
  };

  // Tải danh sách lúc vào trang.
  // Gọi API trong effect là việc đồng bộ với nguồn dữ liệu bên ngoài; cờ cancelled
  // để không setState sau khi đã rời trang.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await getConversationList();

        if (!cancelled) {
          setConversations(data);
          setUnreadUserIds(getUnreadUserIds(data));
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách cuộc trò chuyện:", error);
      } finally {
        if (!cancelled) setConversationLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Lấy tin nhắn khi chọn một khách hàng.
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        setMessageLoading(true);

        const data = await getConversationMessages(selectedUserId);
        setMessages(data);
      } catch (error) {
        console.error("Lỗi lấy lịch sử tin nhắn:", error);
      } finally {
        setMessageLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  // Nhận tin nhắn mới từ Socket.IO.
  useEffect(() => {
    const handleNewMessage = (event) => {
      const message = event.detail;
      if (!message) return;
      const userId = message.userId;
      const isSelected = String(userId) === String(selectedUserIdRef.current);

      const conversationExists = conversationsRef.current.some(
        (conversation) => String(conversation.user.id) === String(userId),
      );

      if (conversationExists) {
        setConversations((prev) => {
          const updated = prev.map((conversation) => {
            if (String(conversation.user.id) !== String(userId))
              return conversation;

            return {
              ...conversation,
              lastMessage: message,
            };
          });

          // Đưa cuộc trò chuyện vừa có tin nhắn lên đầu.
          const index = updated.findIndex(
            (conversation) => String(conversation.user.id) === String(userId),
          );

          if (index > 0) {
            const [conversation] = updated.splice(index, 1);
            updated.unshift(conversation);
          }

          return updated;
        });
      } else {
        // Khách mới nhắn lần đầu.
        fetchConversations();
      }

      if (isSelected) {
        setMessages((prev) => [...prev, message]);
        markConversationRead(userId, message.id);
        window.dispatchEvent(
          new CustomEvent("admin-chat:read", {
            detail: { userId, messageId: message.id },
          }),
        );
      } else if (!message.fromAdmin) {
        setUnreadUserIds((prev) =>
          prev.some((id) => String(id) === String(userId))
            ? prev
            : [...prev, userId],
        );
      }
    };

    window.addEventListener("admin-chat:new-message", handleNewMessage);
    return () =>
      window.removeEventListener("admin-chat:new-message", handleNewMessage);
  }, []);

  // Chọn cuộc trò chuyện.
  // Xoá tin nhắn cũ ngay khi bấm chuyển khách, để không thấy nhầm
  // tin của khách trước trong lúc chờ tải khách mới.
  const handleSelectConversation = (userId) => {
    const conversation = conversationsRef.current.find(
      (item) => String(item.user.id) === String(userId),
    );
    const messageId = conversation?.lastMessage?.id;
    markConversationRead(userId, messageId);
    setMessages([]);
    setSelectedUserId(userId);
    setUnreadUserIds((prev) =>
      prev.filter((id) => String(id) !== String(userId)),
    );
    window.dispatchEvent(
      new CustomEvent("admin-chat:read", { detail: { userId, messageId } }),
    );
  };

  // Admin gửi tin nhắn cho khách đang chọn.
  const handleSend = (content) => {
    if (!selectedUserId)
      return Promise.resolve({ error: "Chưa chọn khách hàng" });

    return sendChatMessage({
      content,
      userId: selectedUserId,
    });
  };

  const selectedConversation = conversations.find(
    (conversation) => conversation.user.id === selectedUserId,
  );

  const hasUnread = unreadUserIds.length > 0;

  return (
    <div className="admin-chat">
      {/* Tiêu đề trang */}
      <div className="admin-chat__heading">
        <div>
          <h2 className="admin-chat__title">
            <MessageCircle /> Chat với khách hàng
          </h2>
          <p className="admin-chat__subtitle">
            Trả lời trực tiếp khách hàng đang cần hỗ trợ
          </p>
        </div>

        <div className="admin-chat__heading-icon">
          <span className="admin-chat__online-dot" />
          Đang kết nối realtime
        </div>
      </div>

      <div className="admin-chat__container">
        {/* Danh sách khách hàng */}
        <aside className="admin-chat__sidebar">
          <div className="admin-chat__sidebar-heading">
            <div>
              <h3>Khách hàng</h3>
              <span>{conversations.length} cuộc trò chuyện</span>
            </div>

            <div className="admin-chat__count">{conversations.length}</div>
          </div>

          <div className="admin-chat__conversation-list">
            {conversationLoading ? (
              <div className="admin-chat__state">
                <span className="admin-chat__spinner" />
                <p>Đang tải danh sách...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="admin-chat__state">
                <div className="admin-chat__state-icon">💬</div>
                <p>Chưa có khách nào nhắn tin</p>
                <span>
                  Khi khách hàng nhắn tin lần đầu, họ sẽ xuất hiện ở đây.
                </span>
              </div>
            ) : (
              conversations.map(({ user, lastMessage }) => {
                const isUnread = unreadUserIds.includes(user.id);

                return (
                  <button
                    type="button"
                    key={user.id}
                    className={`admin-chat__conversation ${
                      user.id === selectedUserId ? "active" : ""
                    }`}
                    onClick={() => handleSelectConversation(user.id)}
                  >
                    <div className="admin-chat__avatar-wrap">
                      <div className="admin-chat__avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <span>{getInitials(user.name)}</span>
                        )}
                      </div>

                      {isUnread && <span className="admin-chat__unread-dot" />}
                    </div>

                    <div className="admin-chat__conversation-info">
                      <div className="admin-chat__conversation-top">
                        <span className="admin-chat__name">{user.name}</span>

                        {isUnread ? (
                          <span className="admin-chat__unread-label">Mới</span>
                        ) : (
                          <span className="admin-chat__last-message">
                            {formatTime(lastMessage?.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="admin-chat__last-message">
                        {lastMessage?.fromAdmin && "Bạn: "}
                        {lastMessage?.content || "Chưa có tin nhắn"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/*  Nội dung chat */}
        <section className="admin-chat__area">
          {selectedConversation ? (
            <>
              <header className="admin-chat__header">
                <div className="admin-chat__header-user">
                  <div className="admin-chat__avatar admin-chat__avatar--header">
                    {selectedConversation.user.avatar ? (
                      <img
                        src={selectedConversation.user.avatar}
                        alt={selectedConversation.user.name}
                      />
                    ) : (
                      <span>{getInitials(selectedConversation.user.name)}</span>
                    )}
                  </div>

                  <div className="admin-chat__header-info">
                    <strong>{selectedConversation.user.name}</strong>
                    <span>
                      <span className="admin-chat__status-dot" />
                      {selectedConversation.user.email}
                    </span>
                  </div>
                </div>

                <div className="admin-chat__header-badge">
                  {messages.length} tin nhắn
                </div>
              </header>

              <div className="admin-chat__body">
                <ChatConversation
                  messages={messages}
                  loading={messageLoading}
                  viewAsAdmin={true}
                  onSend={handleSend}
                  emptyText="Chưa có tin nhắn"
                />
              </div>
            </>
          ) : (
            <div className="admin-chat__welcome">
              <div className="admin-chat__welcome-icon">
                <MessageCircle size={48} strokeWidth={2} />
              </div>

              <h3>Chọn một khách hàng</h3>
              <p>
                Chọn 1 khách hàng ở danh sách bên trái để xem lịch sử trò chuyện
                và trả lời tin nhắn của họ.
              </p>

              {hasUnread && <p>Bạn có tin nhắn mới đang chờ trả lời.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminChat;
