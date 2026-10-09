import api from "./api";

export const getAddress = async () => (await api.get("/profile/address")).data;

export const createAddress = async (data) =>
  (await api.post("/profile/address", data)).data;

export const updateAddress = async ({ id, ...data }) =>
  (await api.patch(`/profile/address/${id}`, data)).data;

export const deleteAddress = async (id) =>
  (await api.delete(`/profile/address/${id}`)).data;

export const setDefaultAddress = async (id) =>
  (await api.patch(`/profile/address/${id}/default`)).data;
