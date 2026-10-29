import api from "./api";

// Lấy danh sách danh mục (public)
export const getCategories = () => api.get("/categories");

// Các hành động quản lý danh mục (admin) — tuỳ chọn mở rộng khi có giao diện quản trị
// export const createCategory = (data) => api.post("/categories", data);

// export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

// export const deleteCategory = (id) => api.delete(`/categories/${id}`);
