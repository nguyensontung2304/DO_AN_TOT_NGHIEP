import api from "./api";

export const getProductionReports = () => api.get("/production-reports");

export const createProductionReport = (payload) =>
  api.post("/production-reports", payload);
export const updateProductionReportStatus = (id, status) =>
  api.put(`/production-reports/${id}/status`, { status });
