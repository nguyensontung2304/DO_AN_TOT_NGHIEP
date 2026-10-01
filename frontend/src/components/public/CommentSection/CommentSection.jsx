import { useState, useEffect } from "react";

import {
  getCommentsProduct,
  createCommentsProduct,
  updateCommentsProduct,
  deleteCommentsProduct,
} from "../../../api/commentsApi";

import { useSelector } from "react-redux";

import "./commentSection.scss";

export function CommentSection({ productId }) {
  const user = useSelector((state) => state.user.currentUser);

  const auth = !!user?.id;

  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editText, setEditText] = useState("");

  // Hiện toàn bộ comment hay chỉ comment mới nhất
  const [showAll, setShowAll] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await getCommentsProduct(productId);

      console.log("=====> GET COMMENT BY PRODUCT", response);
      console.log(
        "Avatar từng bình luận:",
        response.map((comment) => ({
          name: comment.user?.name,
          avatar: comment.user?.avatar,
        })),
      );
      const commentsData = response.data || response;

      console.log("Bình luận đầu tiên:", commentsData[0]);
      console.log("User của bình luận:", commentsData[0]?.user);
      console.log("Avatar của người bình luận:", commentsData[0]?.user?.avatar);

      setComments(commentsData);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.trim() || submitting) return;

    if (!auth) {
      alert("Vui lòng đăng nhập để bình luận");
      return;
    }

    try {
      setSubmitting(true);

      await createCommentsProduct(productId, {
        content: newComment.trim(),
      });

      setNewComment("");

      fetchComments();
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error);

      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await updateCommentsProduct(commentId, {
        content: editText.trim(),
      });

      setEditingId(null);

      fetchComments();
    } catch (error) {
      console.error("Lỗi cập nhật bình luận:", error);

      alert("Không thể cập nhật bình luận.");
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await deleteCommentsProduct(commentId);

      fetchComments();
    } catch (error) {
      console.error("Lỗi xóa bình luận:", error);

      alert("Không thể xóa bình luận.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canModify = (comment) => user && comment.user?.id === user.id;

  // Nếu showAll = false → chỉ lấy 1 comment đầu tiên
  // Nếu showAll = true → lấy toàn bộ comment
  const visibleComments = showAll ? comments : comments.slice(0, 1);

  if (loading) {
    return (
      <div className="comment-section">
        <div className="comments-loading">Đang tải bình luận...</div>
      </div>
    );
  }

  return (
    <section className="comment-section">
      <h3 className="section-title">Bình luận ({comments.length})</h3>

      {auth && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={3}
            className="comment-textarea"
            disabled={submitting}
          />

          <div className="comment-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </form>
      )}

      {!auth && (
        <div className="comment-login-prompt">
          <p>
            Đăng nhập để <a href="/login">bình luận</a> hoặc{" "}
            <a href="/register">đăng ký</a> tài khoản mới.
          </p>
        </div>
      )}

      <ul className="comments-list">
        {comments.length === 0 ? (
          <li className="no-comments">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </li>
        ) : (
          visibleComments.map((comment) => (
            <li key={comment.id} className="comment">
              <div className="comment-header">
                <div className="comment-author">
                  <div className="avatar">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={`Ảnh đại diện của ${comment.user.name || "người dùng"}`}
                      />
                    ) : (
                      <span>
                        {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  <div className="author-info">
                    <span className="author-name">
                      {comment.user?.name || "Ẩn danh"}
                    </span>

                    <time className="comment-date" dateTime={comment.createdAt}>
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                </div>

                {canModify(comment) && (
                  <div className="comment-actions">
                    {editingId === comment.id ? (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(comment.id)}
                        >
                          Lưu
                        </button>

                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingId(null)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditText(comment.content);
                          }}
                        >
                          Sửa
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(comment.id)}
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="comment-edit-textarea"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p className="comment-content">{comment.content}</p>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Chỉ hiện nút khi có từ 2 comment trở lên */}
      {comments.length > 1 && (
        <div className="comments-toggle">
          <button
            type="button"
            className="comments-toggle-btn"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll
              ? "Thu gọn bình luận ↑"
              : `Xem thêm ${comments.length - 1} bình luận ↓`}
          </button>
        </div>
      )}
    </section>
  );
}
