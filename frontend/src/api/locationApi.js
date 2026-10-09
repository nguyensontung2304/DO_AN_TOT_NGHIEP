import api from "./api";

// Hai API nội bộ dùng cùng VITE_API_URL, chạy được ở localhost và khi deploy.
export const getProvinces = async () =>
  (await api.get("/locations/provinces")).data;

export const getWards = async (provinceCode) =>
  (await api.get(`/locations/provinces/${provinceCode}/wards`)).data;
