import api from "./api";

export const getHandoverOrders = () => api.get("/handover-orders");

export const createHandoverOrder = (payload) =>
  api.post("/handover-orders", payload);

export const updateHandoverOrderStatus = (id, status) =>
  api.put(`/handover-orders/${id}/status`, { status });

export const deleteHandoverOrder = (id) =>
  api.delete(`/handover-orders/${id}`);
