import api from "./api";

export const getFinishedGoods = () => api.get("/finished-goods");

export const createFinishedGood = (payload) =>
  api.post("/finished-goods", payload);

export const updateFinishedGood = (id, payload) =>
  api.put(`/finished-goods/${id}`, payload);

export const deleteFinishedGood = (id) =>
  api.delete(`/finished-goods/${id}`);
