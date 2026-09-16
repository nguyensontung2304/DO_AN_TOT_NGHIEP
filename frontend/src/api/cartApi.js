import api from "./api";

export const getCartByUserId = (userId) => api.get(`/cart/${userId}`);

export const addToCart = (cartData) => api.post("/cart", cartData);

export const updateCartQty = (cartData) => api.put("/cart", cartData);

export const removeFromCart = (userId, productId) =>
  api.delete(`/cart/${userId}/${productId}`);
