import api from "./api";
export const createOrder = (orderData) => api.post("/orders", orderData); // user tạo đơn

export const getOrdersByUserId = (userId) => api.get(`/orders/user/${userId}`); // user xem đơn mình

export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`); // user hủy đơn mình

export const getAllOrders = () => api.get("/orders"); // admin xem tất cả

export const getOrderById = (id) => api.get(`/orders/${id}`); // admin xem chi tiết

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }); // admin cập nhật trạng thái
