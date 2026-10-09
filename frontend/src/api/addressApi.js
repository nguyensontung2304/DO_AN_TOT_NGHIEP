import api from "./api";

export const getAddresses = async () =>
  (await api.get("/profile/addresses")).data;

export const createAddress = async (data) =>
  (await api.post("/profile/addresses", data)).data;

export const updateAddress = async ({ id, ...data }) =>
  (await api.patch(`/profile/addresses/${id}`, data)).data;

export const deleteAddress = async (id) =>
  (await api.delete(`/profile/addresses/${id}`)).data;

export const setDefaultAddress = async (id) =>
  (await api.patch(`/profile/addresses/${id}/default`)).data;
