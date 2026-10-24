const STORAGE_KEY = "adminChatLastReadMessageByUser";

const readState = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const isConversationUnread = (conversation) => {
  const userId = conversation?.user?.id;
  const messageId = Number(conversation?.lastMessage?.id || 0);
  if (userId == null || !messageId || conversation.lastMessage.fromAdmin) {
    return false;
  }

  return messageId > Number(readState()[userId] || 0);
};

export const markConversationRead = (userId, messageId) => {
  if (userId == null) return;

  const state = readState();
  state[userId] = Math.max(Number(state[userId] || 0), Number(messageId || 0));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
