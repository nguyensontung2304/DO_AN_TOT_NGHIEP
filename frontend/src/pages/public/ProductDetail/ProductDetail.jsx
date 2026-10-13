import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  ShoppingCart,
  LockKeyhole,
  Zap,
  ShieldCheck,
  Truck,
  RefreshCcw,
  Phone,
  Wrench,
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProductById, getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../constants/router";
import { createOrUpdateRating, getMyRating } from "../../../api/ratingApi";
import { RatingStars } from "../../../components/public/RatingStarts/RatingStarts";
import { CommentSection } from "../../../components/public/CommentSection/CommentSection";
import "./productDetail.scss";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  const currentUser = useSelector((state) => state.user.currentUser);
  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState("rating");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const getProductDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProductById(id);
        const currentProduct = response.data;
        setProduct(currentProduct);

        const productsResponse = await getProducts({
          category: currentProduct.categoryName,
          page: 1,
          limit: 5,
        });

        const relatedProducts = (productsResponse.data.products || [])
          .filter((item) => item.id !== currentProduct.id)
          .slice(0, 4);
        setRelated(relatedProducts);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    getProductDetail();
  }, [id]);

  const handleAddToCart = async () => {
    if (!currentUser?.id) {
      navigate(ROUTES.USER.LOGIN, {
        state: {
          from: getPath(ROUTES.USER.PRODUCT_DETAIL, { id }),
        },
      });
      return false;
    }

    try {
      setAdding(true);
      setAddError("");

      await addToCart({
        userId: currentUser.id,
        productId: product.id,
        qty,
      });

      window.dispatchEvent(new Event("cartUpdated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      return true;
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);
      setAddError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Không thêm được vào giỏ hàng, vui lòng thử lại.",
      );
      return false;
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) navigate(ROUTES.USER.CART);
  };

  const fetchUserRating = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await getMyRating(id);
      setUserRating(response?.data?.rating || response?.rating || null);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
      setUserRating(null);
    }
  };

  useEffect(() => {
    fetchUserRating();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="pd-page-notfound">
        <span className="pd-page-notfound-icon">
          <Clock size={28} />
        </span>
        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page-notfound">
        <span className="pd-page-notfound-icon">
          <LockKeyhole size={28} />
        </span>
        <h2>Không tìm thấy sản phẩm</h2>
        <p>{error || "Sản phẩm này không tồn tại hoặc đã bị xóa."}</p>
        <Link
          to={ROUTES.USER.PRODUCT_LIST}
          className="pd-page-btn pd-page-btn-primary"
        >
          ← Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  const discount = product.old_price
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

  const handleRate = async (rating) => {
    if (!currentUser?.id) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (userRating) {
      if (rating !== userRating) {
        alert("Bạn đã đánh giá sản phẩm này rồi, không thể thay đổi!");
      }
      return;
    }

    if (ratingLoading) return;

    try {
      setRatingLoading(true);
      await createOrUpdateRating(id, { rating });
      await fetchUserRating();
      const response = await getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error("Lỗi đánh giá:", error);
      alert("Không thể gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="pd-page">
      <div className="pd-page-breadcrumb">
        <div className="pd-page-breadcrumb-inner">
          <Link to={ROUTES.USER.HOME}>Trang chủ</Link>
          <span>›</span>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Sản phẩm</Link>
          <span>›</span>
          <span>{product.categoryName}</span>
          <span>›</span>
          <span className="pd-page-breadcrumb-current">{product.name}</span>
        </div>
      </div>

      <main className="pd-page-main">
        <section className="pd-page-product-top">
          <div className="pd-page-product-image">
            <div className="pd-page-gallery-main">
              {product.badge && (
                <span className="pd-page-gallery-badge">{product.badge}</span>
              )}
              {discount && (
                <span className="pd-page-gallery-discount">-{discount}%</span>
              )}
              <div className="pd-page-gallery-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span>Không có ảnh</span>
                )}
              </div>
            </div>
            <p className="pd-page-gallery-hint">Hình ảnh minh họa</p>
          </div>

          <div className="pd-page-product-info">
            <span className="pd-page-info-category">
              {product.categoryName}
            </span>
            <h1 className="pd-page-info-name">{product.name}</h1>

            <div className="pd-page-info-price-row">
              <strong className="pd-page-info-price">
                {Number(product.price).toLocaleString("vi-VN")}₫
              </strong>
              {product.old_price && (
                <>
                  <s className="pd-page-info-old-price">
                    {Number(product.old_price).toLocaleString("vi-VN")}₫
                  </s>
                  <span className="pd-page-info-discount-tag">
                    Tiết kiệm{" "}
                    {(
                      Number(product.old_price) - Number(product.price)
                    ).toLocaleString("vi-VN")}
                    ₫
                  </span>
                </>
              )}
            </div>

            <p className="pd-page-info-short-desc">{product.description}</p>

            <div className="pd-page-actions">
              <div className="pd-page-qty">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  onClick={() =>
                    setQty((currentQty) => Math.max(1, currentQty - 1))
                  }
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  onClick={() => setQty((currentQty) => currentQty + 1)}
                >
                  +
                </button>
              </div>

              {currentUser ? (
                <button
                  className={`pd-page-btn pd-page-btn-add ${added ? "pd-page-btn-added" : ""}`}
                  onClick={handleAddToCart}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <Clock size={18} className="pd-page-icon-spin" /> Đang
                      thêm...
                    </>
                  ) : added ? (
                    <>
                      <CheckCircle size={18} /> Đã thêm {qty} vào giỏ
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Thêm vào giỏ hàng
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={ROUTES.USER.LOGIN}
                  state={{
                    from: getPath(ROUTES.USER.PRODUCT_DETAIL, {
                      id: product.id,
                    }),
                  }}
                  className="pd-page-btn pd-page-btn-guest"
                >
                  <LockKeyhole size={18} /> Đăng nhập để đặt hàng
                </Link>
              )}
            </div>

            {currentUser && (
              <button
                className="pd-page-btn pd-page-btn-buy-now"
                onClick={handleBuyNow}
                disabled={adding}
              >
                <Zap size={18} /> Mua ngay
              </button>
            )}
            {addError && <p className="pd-page-add-error">{addError}</p>}
          </div>
        </section>

        <section className="pd-page-product-details">
          <div className="pd-page-long-description">
            <h2 className="pd-page-section-title">Mô tả sản phẩm</h2>
            <p className="pd-page-long-description-content">
              {product.long_description}
            </p>

            <div className="pd-page-feedback">
              <div
                className="pd-page-feedback-tabs"
                role="tablist"
                aria-label="Bình luận và đánh giá"
              >
                <button
                  type="button"
                  className={`pd-page-feedback-tab ${activeFeedbackTab === "comment" ? "is-active" : ""}`}
                  role="tab"
                  aria-selected={activeFeedbackTab === "comment"}
                  onClick={() => setActiveFeedbackTab("comment")}
                >
                  Bình luận
                </button>
                <button
                  type="button"
                  className={`pd-page-feedback-tab ${activeFeedbackTab === "rating" ? "is-active" : ""}`}
                  role="tab"
                  aria-selected={activeFeedbackTab === "rating"}
                  onClick={() => setActiveFeedbackTab("rating")}
                >
                  Đánh giá sao
                </button>
              </div>

              <div className="pd-page-feedback-panel" role="tabpanel">
                {activeFeedbackTab === "comment" ? (
                  <CommentSection productId={id} />
                ) : (
                  <div className="pd-page-rating-section">
                    <div className="pd-page-rating-header">
                      <h2>Đánh giá sản phẩm</h2>
                    </div>
                    <div className="pd-page-rating-summary">
                      <div className="pd-page-rating-score">
                        <strong>
                          {Number(product.averageRating || 0).toFixed(1)}
                        </strong>
                        <span>/ 5</span>
                      </div>
                      <div className="pd-page-rating-stars">
                        <RatingStars
                          rating={Number(product.averageRating) || 0}
                          size={40}
                          readonly
                        />
                        <span>{product.ratingsCount || 0} đánh giá</span>
                      </div>
                    </div>

                    {currentUser ? (
                      <div className="pd-page-user-rating">
                        <div className="pd-page-user-rating-header">
                          <span className="pd-page-user-rating-label">
                            Đánh giá của bạn
                          </span>
                          {userRating && (
                            <span className="pd-page-user-rating-status">
                              ✓ Đã đánh giá
                            </span>
                          )}
                        </div>
                        <div className="pd-page-user-rating-content">
                          <RatingStars
                            rating={userRating || 0}
                            size={38}
                            interactive
                            onRate={handleRate}
                            readonly={ratingLoading || !!userRating}
                          />
                          {userRating ? (
                            <p className="pd-page-user-rating-note">
                              Bạn đã đánh giá {userRating} sao cho sản phẩm này.
                            </p>
                          ) : (
                            <p className="pd-page-user-rating-note">
                              Nhấn vào số sao để đánh giá sản phẩm.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pd-page-rating-login">
                        <div className="pd-page-rating-login-icon">⭐</div>
                        <div className="pd-page-rating-login-content">
                          <strong>Chia sẻ đánh giá của bạn</strong>
                          <p>Đăng nhập để đánh giá sản phẩm này.</p>
                        </div>
                        <Link
                          to={ROUTES.USER.LOGIN}
                          state={{
                            from: getPath(ROUTES.USER.PRODUCT_DETAIL, {
                              id: product.id,
                            }),
                          }}
                          className="pd-page-rating-login-button"
                        >
                          Đăng nhập
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="pd-page-technical">
            {product.specs && product.specs.length > 0 && (
              <div className="pd-page-specs">
                <h2 className="pd-page-section-title">Thông số kỹ thuật</h2>
                <table className="pd-page-specs-table">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.id}>
                        <td className="pd-page-specs-key">{spec.spec_name}</td>
                        <td className="pd-page-specs-value">
                          {spec.spec_value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {product.recipe && product.recipe.length > 0 && (
              <details className="pd-page-recipe">
                <summary>
                  <Wrench size={18} /> Nguyên vật liệu sản xuất (
                  {product.recipe.length} loại)
                </summary>
                <ul className="pd-page-recipe-list">
                  {product.recipe.map((item) => (
                    <li key={item.id}>
                      <span>{item.material_name}</span>
                      <strong>
                        {item.qty} {item.unit}
                      </strong>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </aside>
        </section>

        <section className="pd-page-guarantees">
          {[
            { icon: <ShieldCheck size={20} />, text: "Bảo hành chính hãng" },
            { icon: <Truck size={20} />, text: "Giao hàng & lắp đặt miễn phí" },
            { icon: <RefreshCcw size={20} />, text: "Đổi trả trong 7 ngày" },
            { icon: <Phone size={20} />, text: "Hỗ trợ 24/7" },
          ].map((guarantee) => (
            <div key={guarantee.text} className="pd-page-guarantees-item">
              <span>{guarantee.icon}</span>
              <p>{guarantee.text}</p>
            </div>
          ))}
        </section>
      </main>

      {related.length > 0 && (
        <section className="pd-page-related">
          <div className="pd-page-related-inner">
            <h2 className="pd-page-related-title">Sản phẩm cùng danh mục</h2>
            <div className="pd-page-related-grid">
              {related.map((item) => (
                <Link
                  to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: item.id })}
                  key={item.id}
                  className="pd-page-related-card"
                >
                  {item.badge && (
                    <span className="pd-page-related-card-badge">
                      {item.badge}
                    </span>
                  )}
                  <div className="pd-page-related-card-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="pd-page-related-card-body">
                    <span className="pd-page-related-card-category">
                      {item.categoryName}
                    </span>
                    <h3 className="pd-page-related-card-name">{item.name}</h3>
                    <div className="pd-page-related-card-price">
                      <strong>
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </strong>
                      {item.old_price && (
                        <s>{Number(item.old_price).toLocaleString("vi-VN")}₫</s>
                      )}
                    </div>
                    <span className="pd-page-related-card-link">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
