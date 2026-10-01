import api from "./api";

export const getMaterials = () => api.get("/materials");

export const createMaterial = (payload) => api.post("/materials", payload);

export const updateMaterialStock = (id, delta) =>
  api.put(`/materials/${id}/stock`, { delta });

// Sửa thông tin vật tư (tên, đơn vị, tồn kho)
export const updateMaterial = (id, payload) =>
  api.put(`/materials/${id}`, payload);

export const deleteMaterial = (id) => api.delete(`/materials/${id}`);
