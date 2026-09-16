import api from "./api";

export const getOrdersByUserId = (userId) => api.get(`/orders/${userId}`);

export const createOrder = (orderData) => api.post("/orders", orderData);
