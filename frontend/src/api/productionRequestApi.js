import api from "./api";

export const getProductionRequests = () => api.get("/production-requests");

// payload: { orderId?, productName, productQty, note, materials }
// hoặc:      { orderId?, note, items: [{ productName, productQty, materials }] }
export const createProductionRequest = (payload) =>
  api.post("/production-requests", payload);

export const updateProductionRequestStatus = (id, status) =>
  api.put(`/production-requests/${id}/status`, { status });

export const deleteProductionRequest = (id) =>
  api.delete(`/production-requests/${id}`);
