import api from "./api";

export const getOrdersByUserId = (userId) => api.get(`/orders/user/${userId}`);

export const getAllOrders = () => api.get("/orders");

export const getOrderById = (id) => api.get(`/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });

export const createOrder = (orderData) => api.post("/orders", orderData);
