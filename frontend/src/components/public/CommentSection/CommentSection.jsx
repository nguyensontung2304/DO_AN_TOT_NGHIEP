/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
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
  const [showAll, setShowAll] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);

      const response = await getCommentsProduct(productId);
      const commentsData = response.data || response;

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

  const visibleComments = showAll ? comments : comments.slice(0, 1);

  if (loading) {
    return (
      <div className="comment-section">
        <div className="comment-section__loading">Đang tải bình luận...</div>
      </div>
    );
  }

  return (
    <section className="comment-section">
      <h3 className="comment-section__title">Bình luận ({comments.length})</h3>

      {auth && (
        <form className="comment-section__form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            rows={3}
            className="comment-section__textarea"
            disabled={submitting}
          />

          <div className="comment-section__form-actions">
            <button
              type="submit"
              className="comment-section__btn comment-section__btn--primary public-button-gradient"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </form>
      )}

      {!auth && (
        <div className="comment-section__login-prompt">
          <p>
            Đăng nhập để <a href="/login">bình luận</a> hoặc{" "}
            <a href="/register">đăng ký</a> tài khoản mới.
          </p>
        </div>
      )}

      <ul className="comment-section__list">
        {comments.length === 0 ? (
          <li className="comment-section__empty">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </li>
        ) : (
          visibleComments.map((comment) => (
            <li key={comment.id} className="comment-section__item">
              <div className="comment-section__header">
                <div className="comment-section__author">
                  <div className="comment-section__avatar">
                    {comment.user?.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={`Ảnh đại diện của ${
                          comment.user.name || "người dùng"
                        }`}
                      />
                    ) : (
                      <span>
                        {comment.user?.name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  <div className="comment-section__author-info">
                    <span className="comment-section__author-name">
                      {comment.user?.name || "Ẩn danh"}
                    </span>

                    <time
                      className="comment-section__date"
                      dateTime={comment.createdAt}
                    >
                      {formatDate(comment.createdAt)}
                    </time>
                  </div>
                </div>

                {canModify(comment) && (
                  <div className="comment-section__actions">
                    {editingId === comment.id ? (
                      <>
                        <button
                          className="comment-section__btn comment-section__btn--primary public-button-gradient comment-section__btn--small"
                          onClick={() => handleEdit(comment.id)}
                        >
                          Lưu
                        </button>

                        <button
                          className="comment-section__btn comment-section__btn--outline comment-section__btn--small"
                          onClick={() => setEditingId(null)}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="comment-section__btn comment-section__btn--outline comment-section__btn--small"
                          onClick={() => {
                            setEditingId(comment.id);
                            setEditText(comment.content);
                          }}
                        >
                          Sửa
                        </button>

                        <button
                          className="comment-section__btn comment-section__btn--danger comment-section__btn--small"
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
                  className="comment-section__edit-textarea"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p className="comment-section__content">{comment.content}</p>
              )}
            </li>
          ))
        )}
      </ul>

      {comments.length > 1 && (
        <div className="comment-section__toggle">
          <button
            type="button"
            className="comment-section__toggle-btn"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? (
              <>
                Thu gọn bình luận <ChevronUp size={20} />
              </>
            ) : (
              <>
                Xem thêm {comments.length - 1} bình luận{" "}
                <ChevronDown size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
