import { useEffect, useRef } from "react";

import { connectSocket, disconnectSocket } from "../api/socketApi";

// Kết nối socket khi component mount, ngắt kết nối khi unmount (vd: đăng xuất, rời trang chat admin)
// onNewMessage(message) được gọi mỗi khi server gửi event "chat:message"
function useChatSocket(onNewMessage) {
  // Lưu hàm mới nhất vào ref: listener của socket chỉ cần đăng ký 1 lần
  // nhưng vẫn luôn gọi đúng phiên bản onNewMessage mới nhất (đọc được state mới nhất)
  const onNewMessageRef = useRef(onNewMessage);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  });

  useEffect(() => {
    const socket = connectSocket();
    const handleNewMessage = (message) => onNewMessageRef.current(message);

    socket.on("chat:message", handleNewMessage);

    return () => {
      socket.off("chat:message", handleNewMessage);
      disconnectSocket();
    };
  }, []);
}

export default useChatSocket;
