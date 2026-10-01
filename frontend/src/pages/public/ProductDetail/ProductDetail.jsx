import { useEffect, useState } from "react";

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
  // LẤY CHI TIẾT SẢN PHẨM
  useEffect(() => {
    const getProductDetail = async () => {
      try {
        setLoading(true);

        setError("");

        // Lấy sản phẩm hiện tại
        const response = await getProductById(id);

        console.log("=====> PRODUCT DETAIL", response);

        setProduct(response.data);

        // Lấy tất cả sản phẩm
        const productsResponse = await getProducts({
          page: 1,
          limit: 5,
        });

        console.log("=====> PRODUCT ALL", productsResponse);

        // Lọc sản phẩm liên quan
        const relatedProducts = (productsResponse.data.products || [])
          .filter((item) => item.id !== response.data.id)
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

  // THÊM VÀO GIỎ HÀNG
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
      await addToCart({
        userId: currentUser.id,
        productId: product.id,
        qty: qty,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      return true;
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);

      return false;
    }
  };

  // MUA NGAY
  const handleBuyNow = async () => {
    const success = await handleAddToCart();

    if (success) {
      navigate(ROUTES.USER.CART);
    }
  };

  const fetchUserRating = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await getMyRating(id);

      console.log("=====> GET MY RATING", response);

      setUserRating(response?.data?.rating || response?.rating || null);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
      setUserRating(null);
    }
  };

  useEffect(() => {
    fetchUserRating();
  }, [id, currentUser]);

  // LOADING
  if (loading) {
    return (
      <div className="pd-notfound">
        <span>⏳</span>

        <h2>Đang tải sản phẩm...</h2>
      </div>
    );
  }

  // NOT FOUND
  if (error || !product) {
    return (
      <div className="pd-notfound">
        <span>😕</span>

        <h2>Không tìm thấy sản phẩm</h2>

        <p>{error || "Sản phẩm này không tồn tại hoặc đã bị xóa."}</p>

        <Link to={ROUTES.USER.PRODUCT_LIST} className="pd-btn pd-btn--primary">
          ← Xem tất cả sản phẩm
        </Link>
      </div>
    );
  }

  // GIẢM GIÁ
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

      // Lấy lại product để cập nhật averageRating và ratingsCount
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
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <div className="pd-breadcrumb__inner">
          <Link to={ROUTES.USER.HOME}>Trang chủ</Link>

          <span>›</span>

          <Link to={ROUTES.USER.PRODUCT_LIST}>Sản phẩm</Link>

          <span>›</span>

          <span>{product.category}</span>

          <span>›</span>

          <span className="pd-breadcrumb__current">{product.name}</span>
        </div>
      </div>

      {/* Main */}
      <div className="pd-main">
        {/* ẢNH + THÔNG TIN SẢN PHẨM */}
        <section className="pd-product-top">
          {/* BÊN TRÁI - ẢNH */}
          <div className="pd-product-image">
            <div className="pd-gallery__main">
              {product.badge && (
                <span className="pd-gallery__badge">{product.badge}</span>
              )}

              {discount && (
                <span className="pd-gallery__discount">-{discount}%</span>
              )}

              <div className="pd-gallery__emoji">{product.emoji}</div>
            </div>

            <p className="pd-gallery__hint">Hình ảnh minh họa</p>
          </div>

          {/* BÊN PHẢI - THÔNG TIN */}
          <div className="pd-product-info">
            <span className="pd-info__cat">{product.category}</span>

            <h1 className="pd-info__name">{product.name}</h1>

            {/* Giá */}
            <div className="pd-info__price-row">
              <strong className="pd-info__price">
                {Number(product.price).toLocaleString("vi-VN")}₫
              </strong>

              {product.old_price && (
                <>
                  <s className="pd-info__old-price">
                    {Number(product.old_price).toLocaleString("vi-VN")}₫
                  </s>

                  <span className="pd-info__discount-tag">
                    Tiết kiệm{" "}
                    {(
                      Number(product.old_price) - Number(product.price)
                    ).toLocaleString("vi-VN")}
                    ₫
                  </span>
                </>
              )}
            </div>

            {/* Mô tả ngắn */}
            <p className="pd-info__short-desc">{product.description}</p>

            {/* Actions */}
            <div className="pd-actions">
              {/* Số lượng */}
              <div className="pd-qty">
                <button
                  onClick={() =>
                    setQty((currentQty) => Math.max(1, currentQty - 1))
                  }
                >
                  −
                </button>

                <span>{qty}</span>

                <button onClick={() => setQty((currentQty) => currentQty + 1)}>
                  +
                </button>
              </div>

              {/* Thêm giỏ hàng */}
              {currentUser ? (
                <button
                  className="pd-btn pd-btn--primary pd-btn--add"
                  onClick={handleAddToCart}
                >
                  🛒 Thêm vào giỏ hàng
                </button>
              ) : (
                <Link
                  to={ROUTES.USER.LOGIN}
                  state={{
                    from: getPath(ROUTES.USER.PRODUCT_DETAIL, {
                      id: product.id,
                    }),
                  }}
                  className="pd-btn pd-btn--guest"
                >
                  🔒 Đăng nhập để đặt hàng
                </Link>
              )}
            </div>

            {/* Mua ngay */}
            {currentUser && (
              <button className="pd-btn pd-btn--buy-now" onClick={handleBuyNow}>
                ⚡ Mua ngay
              </button>
            )}
          </div>
        </section>

        {/* MÔ TẢ DÀI + THÔNG SỐ + NGUYÊN VẬT LIỆU */}
        <section className="pd-product-details">
          {/* BÊN TRÁI - MÔ TẢ DÀI */}
          <div className="pd-long-description">
            <h2 className="pd-section-title">Mô tả sản phẩm</h2>

            {/* Mô tả dài */}
            <p className="pd-long-description__content">
              {product.long_description}
            </p>

            {/* Nguyên vật liệu */}
            {product.recipe && product.recipe.length > 0 && (
              <details className="pd-recipe">
                <summary>
                  🔩 Nguyên vật liệu sản xuất ({product.recipe.length} loại)
                </summary>

                <ul className="pd-recipe__list">
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
          </div>

          {/* BÊN PHẢI */}
          <div className="pd-technical">
            {/* Thông số kỹ thuật */}
            {product.specs && product.specs.length > 0 && (
              <div className="pd-specs">
                <h2 className="pd-section-title">Thông số kỹ thuật</h2>

                <table className="pd-specs__table">
                  <tbody>
                    {product.specs.map((spec) => (
                      <tr key={spec.id}>
                        <td className="pd-specs__key">{spec.spec_name}</td>

                        <td className="pd-specs__val">{spec.spec_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ĐÁNH GIÁ + BÌNH LUẬN */}
        <section className="pd-rating-row">
          {/* BÊN TRÁI - ĐÁNH GIÁ */}
          <div className="pd-rating-section">
            <div className="pd-rating-header">
              <h2>Đánh giá sản phẩm</h2>
            </div>

            {/* Điểm trung bình */}
            <div className="pd-rating-summary">
              <div className="pd-rating-score">
                <strong>{Number(product.averageRating || 0).toFixed(1)}</strong>

                <span>/ 5</span>
              </div>

              <div className="pd-rating-stars">
                <RatingStars
                  rating={Number(product.averageRating) || 0}
                  size={50}
                  readonly
                />

                <span>{product.ratingsCount || 0} đánh giá</span>
              </div>
            </div>

            {/* Người dùng đánh giá */}
            {currentUser ? (
              <div className="pd-user-rating">
                <div className="pd-user-rating__header">
                  <span className="pd-user-rating__label">
                    Đánh giá của bạn
                  </span>

                  {userRating && (
                    <span className="pd-user-rating__status">
                      ✓ Đã đánh giá
                    </span>
                  )}
                </div>

                <div className="pd-user-rating__content">
                  <RatingStars
                    rating={userRating || 0}
                    size={38}
                    interactive
                    onRate={handleRate}
                    readonly={ratingLoading || !!userRating}
                  />

                  {userRating ? (
                    <p className="pd-user-rating__note">
                      Bạn đã đánh giá {userRating} sao cho sản phẩm này.
                    </p>
                  ) : (
                    <p className="pd-user-rating__note">
                      Nhấn vào số sao để đánh giá sản phẩm.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="pd-rating-login">
                <div className="pd-rating-login__icon">⭐</div>

                <div className="pd-rating-login__content">
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
                  className="pd-rating-login__button"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* BÊN PHẢI - BÌNH LUẬN */}
          <div className="pd-rating-comment">
            <CommentSection productId={id} />
          </div>
        </section>

        {/* CAM KẾT */}
        <section className="pd-guarantees">
          {[
            {
              icon: "🛡️",
              text: "Bảo hành chính hãng",
            },
            {
              icon: "🚚",
              text: "Giao hàng & lắp đặt miễn phí",
            },
            {
              icon: "🔄",
              text: "Đổi trả trong 7 ngày",
            },
            {
              icon: "📞",
              text: "Hỗ trợ 24/7",
            },
          ].map((guarantee) => (
            <div key={guarantee.text} className="pd-guarantees__item">
              <span>{guarantee.icon}</span>

              <p>{guarantee.text}</p>
            </div>
          ))}
        </section>
      </div>

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <div className="pd-related">
          <div className="pd-related__inner">
            <h2 className="pd-related__title">Sản phẩm cùng danh mục</h2>

            <div className="pd-related__grid">
              {related.map((item) => (
                <Link
                  to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: item.id })}
                  key={item.id}
                  className="pd-related-card"
                >
                  {item.badge && (
                    <span className="pd-related-card__badge">{item.badge}</span>
                  )}

                  <div className="pd-related-card__img">{item.emoji}</div>

                  <div className="pd-related-card__body">
                    <span className="pd-related-card__cat">
                      {item.category}
                    </span>

                    <h3 className="pd-related-card__name">{item.name}</h3>

                    <div className="pd-related-card__price">
                      <strong>
                        {Number(item.price).toLocaleString("vi-VN")}₫
                      </strong>

                      {item.old_price && (
                        <s>{Number(item.old_price).toLocaleString("vi-VN")}₫</s>
                      )}
                    </div>

                    <span className="pd-related-card__link">
                      Xem chi tiết →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
