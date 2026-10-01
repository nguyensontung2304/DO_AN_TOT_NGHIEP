import api from "./api";

/**
 * Lấy danh sách đánh giá của bài viết
 * API: GET /posts/:postId/ratings
 * Query params: { page, limit }
 * Kết quả: { data: Rating[], total, page, limit, totalPages, averageRating, ratingsCount }
 */
// export const getRatingsByProduct = async (productId, params = {}) => {
//   // console.log("=======> productId getRatingsByProduct:", productId);
//   // console.log("=======> params getRatingsByProduct:", params);

//   const response = await api.get(`/ratings/${productId}`, { params });
//   return response.data;
// };

/**
 * Tạo hoặc cập nhật đánh giá (cần đăng nhập)
 * API: POST /posts/:postId/ratings - data: { rating: 1-5 }
 * Kết quả: Rating (với id, createdAt, user)
 */
export const createOrUpdateRating = async (productId, data) => {
  // console.log("=======> productId createOrUpdateRating:", productId);
  // console.log("=======> data createOrUpdateRating:", data);

  const response = await api.post(`/ratings/${productId}`, data);
  return response.data;
};

/**
 * Lấy đánh giá của user hiện tại cho bài viết (cần đăng nhập)
 * API: GET /posts/:postId/ratings/me
 * Kết quả: Rating hoặc null (nếu chưa đánh giá)
 */
export const getMyRating = async (productId) => {
  // console.log("=======> productId getMyRating:", productId);

  const response = await api.get(`/ratings/${productId}/me`);
  return response.data;
};

/**
 * Xóa đánh giá (cần đăng nhập, phải là tác giả)
 * API: DELETE /ratings/:id
 * Kết quả: { message }
 */
// export const deleteRating = async (id) => {
//   // console.log("=======> id deleteRating:", id);
//   const response = await api.delete(`/ratings/${id}`);
//   return response.data;
// };

/**
 * Lấy thống kê đánh giá của bài viết
 * API: GET /posts/:postId/ratings/stats
 * Kết quả: { averageRating, ratingsCount, distribution: { 1: count, 2: count, 3: count, 4: count, 5: count } }
 */
// export const getRatingStats = async (productId) => {
//   const response = await api.get(`/ratings/${productId}/stats`);
//   return response.data;
// };
