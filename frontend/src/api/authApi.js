import api from "./api";

export const register = (userData) => api.post("/auth/register", userData);

export const login = (credentials) => api.post("/auth/login", credentials);

export const logout = () => api.post("/auth/logout");

export const getMyProfile = () => api.get("/auth/profile");

export const changePassword = (data) =>
  api.put("/auth/profile/change-password", data);

export const updateMyProfile = (userId, userData) =>
  api.put(`/auth/profile/${userId}`, userData);

export const updateMyAvatar = (formData) => {
  return api.patch("/auth/profile/avatar", formData);
};

export const forgotPassword = async (data) =>
  (await api.post("/auth/forgot-password", data)).data;

export const validateResetPasswordLink = async (token, signal) =>
  (await api.post("/auth/reset-password/validate", { token }, { signal })).data;

export const resetPassword = async (data) =>
  (await api.post("/auth/reset-password", data)).data;
