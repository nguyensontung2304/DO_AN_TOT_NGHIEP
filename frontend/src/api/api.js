import axios from "axios";

// Instance axios dùng chung cho toàn bộ project
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor request: tự động gắn access token vào header trước khi gửi request
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Refresh token đang được xin, dùng chung cho mọi request cùng bị 401.
// Trước đây mỗi request 401 tự gọi POST /refresh-token riêng, nhiều request
// chạy song sinh sẽ tạo nhiều access token và dễ đè lên nhau.
let refreshPromise = null;

// Dùng refresh token để xin access token mới rồi lưu lại vào localStorage
// Dùng chung cho interceptor bên dưới và socket.io (services/socket.js)
export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh-token", {
        refreshToken: localStorage.getItem("refreshToken"),
      })
      .then((response) => {
        const newAccessToken = response.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        return newAccessToken;
      })
      .finally(() => {
        // Cho phép lần sau refresh mới
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// Interceptor response: nếu access token hết hạn (401) thì dùng refresh token
// để xin access token mới, rồi gọi lại request ban đầu
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest.url?.includes("/refresh-token");

    // _retry: đánh dấu request này đã thử refresh 1 lần, tránh lặp vô hạn
    if (isUnauthorized && !isRefreshRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        // CHỈ đăng xuất khi server thực sự từ chối refresh token (401).
        // Trước đây mọi lỗi — kể cả rớt mạng, server chết, timeout — đều dẫn
        // tới xoá token và nhảy về /login, nên người dùng bị đăng xuất oan
        // dù không hề thao tác gì.
        if (refreshError?.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        } else {
          console.warn(
            "Không làm mới được access token (lỗi tạm thời), giữ nguyên phiên:",
            refreshError?.message,
          );
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
