import api from "./api";

/**
 * Lấy danh sách bình luận của sản phẩm
 * API: GET /Products/:productId/comments
 * Query params: { page, limit, sortBy, sortOrder }
 * Kết quả: { data: Comment[], total, page, limit, totalPages }
 */
export const getCommentsProduct = async (productId, params = {}) => {
  //   console.log("=======> productId getCommentsProduct:", productId);
  //   console.log("=======> params getCommentsProduct:", params);

  const response = await api.get(`/comments/product/${productId}`, { params });
  return response.data;
};

/**
 * Tạo bình luận mới (cần đăng nhập)
 * API: Product /Products/:productId/comments - data: { content, parentId? }
 * Kết quả: Comment (với id, createdAt, author)
 */
export const createCommentsProduct = async (productId, data) => {
  //   console.log("=======> productId createCommentsProduct:", productId);
  //   console.log("=======> data createCommentsProduct:", data);

  const response = await api.post(`/comments/product/${productId}`, data);
  return response.data;
};

/**
 * Cập nhật bình luận (cần đăng nhập, phải là tác giả)
 * API: PUT /comments/:commentId - data: { content }
 * Kết quả: Comment (đã cập nhật)
 */
export const updateCommentsProduct = async (commentId, data) => {
  //   console.log("=======> commentId updateCommentsProduct:", commentId);
  //   console.log("=======> data updateCommentsProduct:", data);
  const response = await api.put(`/comments/${commentId}`, data);
  return response.data;
};

/**
 * Xóa bình luận (cần đăng nhập, phải là tác giả hoặc admin)
 * API: DELETE /comments/:commentId
 * Kết quả: { message }
 */
export const deleteCommentsProduct = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

/**
 * Like/Unlike bình luận (cần đăng nhập)
 * API: Product /comments/:id/like
 * Kết quả: { liked: boolean, likesCount: number }
 */
// export const toggleLikeComment = async (id) => {
//   const response = await api.Product(`/comments/${id}/like`);
//   return response.data;
// };

/**
 * Lấy bình luận cha (để trả lời)
 * API: GET /comments/:id/replies
 * Query params: { page, limit }
 * Kết quả: { data: Comment[], total, page, limit, totalPages }
 */
// export const getCommentReplies = async (id, params = {}) => {
//   const response = await api.get(`/comments/${id}/replies`, { params });
//   return response.data;
// };
