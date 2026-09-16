import api from "./api";

export const registerUser = (userData) => api.post("/auth/register", userData);

export const loginUser = (credentials) => api.post("/auth/login", credentials);

export const getUserById = (userId) => api.get(`/auth/${userId}`);

export const updateUserById = (userId, userData) =>
  api.put(`/auth/login/${userId}`, userData);
