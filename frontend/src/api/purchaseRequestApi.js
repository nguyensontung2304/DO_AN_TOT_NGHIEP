import api from "./api";

export const getPurchaseRequests = () => api.get("/purchase-requests");

export const createPurchaseRequest = (data) =>
  api.post("/purchase-requests", data);

export const updatePurchaseRequestStatus = (id, status) => {
  return api.put(`/purchase-requests/${id}/status`, { status });
};

export const deletePurchaseRequest = (id) =>
  api.delete(`/purchase-requests/${id}`);
