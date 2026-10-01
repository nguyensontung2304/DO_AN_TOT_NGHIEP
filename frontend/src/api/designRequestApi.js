import api from "./api";

export const getDesignRequests = () => api.get("/design-requests");

export const createDesignRequest = (payload) =>
  api.post("/design-requests", payload);

export const provideDesign = (id, designNote) =>
  api.put(`/design-requests/${id}/design`, { designNote });
