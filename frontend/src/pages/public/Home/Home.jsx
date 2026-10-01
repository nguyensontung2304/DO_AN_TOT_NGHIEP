import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../constants/router";
import "./home.scss";

// ProductCard
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);

  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!currentUser?.id) {
      window.location.href = ROUTES.USER.LOGIN;
      return;
    }

    try {
      await addToCart({
        userId: currentUser.id,
        productId: product.id,
        qty: 1,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err.response?.data || err);
    }
  };

  return (
    <div className="product-card">
      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      <Link
        to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
          id: product.id,
        })}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.emoji}
      </Link>

      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>

        <h3 className="product-card__name">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
          >
            {product.name}
          </Link>
        </h3>

        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>

          {product.old_price && (
            <>
              <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>

              <span className="product-card__discount">
                -
                {Math.round(
                  (1 - Number(product.price) / Number(product.old_price)) * 100,
                )}
                %
              </span>
            </>
          )}
        </div>

        <div className="product-card__evaluate">
          <span className="evaluate">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="icon"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {product.commentsCount || 0}
          </span>
          <span className="evaluate">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="icon"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {product.ratingsCount || 0}
          </span>
        </div>

        <div className="product-card__btns">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
            className="product-card__detail-btn"
          >
            Chi tiết
          </Link>

          {currentUser ? (
            <button
              className={`product-card__btn ${
                added ? "product-card__btn--added" : ""
              }`}
              onClick={handleAdd}
            >
              {added ? "✅ Đã thêm!" : "🛒 Thêm giỏ"}
            </button>
          ) : (
            <Link
              to={ROUTES.USER.LOGIN}
              className="product-card__btn product-card__btn--guest"
              state={{ from: ROUTES.USER.HOME }}
            >
              🔒 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// CategorySection — hiển thị 4 sản phẩm của 1 danh mục
function CategorySection({ categoryName, products, onViewMore }) {
  const displayed = products.slice(0, 4);
  return (
    <div className="home__cat-section">
      <div className="home__cat-section__head">
        <h2 className="home__cat-section__title">{categoryName}</h2>
        <button
          className="home__cat-viewmore"
          onClick={() => onViewMore(categoryName)}
        >
          Xem thêm →
        </button>
      </div>
      <div className="products-grid">
        {displayed.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

// Home
export default function Home() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // Lấy tất cả sản phẩm (limit lớn để lấy đủ cho 7 category × 4 sp)
        const res = await getProducts({ limit: 200 });
        const data = res.data;
        setAllProducts(Array.isArray(data.products) ? data.products : []);
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Nhóm sản phẩm theo category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat.name] = allProducts.filter((p) => p.category === cat.name);
    return acc;
  }, {});

  // Chỉ lấy 7 category đầu tiên
  const displayedCategories = categories.slice(0, 7);

  const handleViewMore = (categoryName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(
      `${ROUTES.USER.PRODUCT_LIST}?category=${encodeURIComponent(categoryName)}`,
    );
  };

  // Render
  return (
    <div className="home">
      {/* HERO */}
      <section className="home__hero">
        <div className="home__hero-content">
          <span className="home__hero-tag">
            ✨ Nội thất cao cấp — trực tiếp từ xưởng
          </span>

          <h1>
            Không gian sống
            <br />
            <span>đẹp hơn mỗi ngày</span>
          </h1>

          <p>
            32 mẫu bàn, ghế, tủ, kệ, sofa được thiết kế tinh tế — chất lượng bền
            vững, giao hàng lắp đặt tận nhà.
          </p>

          <div className="home__hero-btns">
            <Link to={ROUTES.USER.PRODUCT_LIST} className="btn btn--primary">
              Xem sản phẩm
            </Link>

            <Link to={ROUTES.USER.CONTACT} className="btn btn--outline">
              Tư vấn miễn phí
            </Link>
          </div>
        </div>

        <div className="home__hero-visual">
          {[
            { icon: "🛋️", label: "Sofa cao cấp" },
            { icon: "🪵", label: "Gỗ tự nhiên" },
            { icon: "🎨", label: "Thiết kế độc quyền" },
            { icon: "🚚", label: "Giao lắp tận nhà" },
          ].map((c) => (
            <div key={c.label} className="home__hero-card">
              <span>{c.icon}</span>
              <p>{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="home__stats">
        <div className="home__stats-inner">
          {[
            { value: "32+", label: "Mẫu sản phẩm" },
            { value: "10.000+", label: "Khách hàng hài lòng" },
            { value: "15 năm", label: "Kinh nghiệm" },
            { value: "100%", label: "Bảo hành chính hãng" },
          ].map((s) => (
            <div key={s.label} className="home__stat">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SECTIONS */}
      <section className="home__products-section" id="products">
        <div className="home__products-inner">
          <h2 className="home__section-title">
            Khám phá sản phẩm theo danh mục
          </h2>

          {loading ? (
            <div className="products-empty">
              <span>⏳</span>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="products-empty">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          ) : (
            displayedCategories.map((cat) => (
              <CategorySection
                key={cat.name}
                categoryName={cat.name}
                products={grouped[cat.name] || []}
                onViewMore={handleViewMore}
              />
            ))
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="home__features-section">
        <div className="home__products-inner">
          <h2 className="home__section-title">Tại sao chọn Nội Thất Việt?</h2>
          <div className="home__features">
            {[
              {
                icon: "🏆",
                title: "Chất lượng cao cấp",
                desc: "Nguyên liệu gỗ tự nhiên và kim loại cao cấp đạt tiêu chuẩn quốc tế.",
              },
              {
                icon: "💰",
                title: "Giá cả hợp lý",
                desc: "Trực tiếp từ xưởng sản xuất, không qua trung gian — tiết kiệm 20–40%.",
              },
              {
                icon: "🚚",
                title: "Giao hàng toàn quốc",
                desc: "Lắp đặt tận nhà miễn phí trong 50km từ TP. HCM.",
              },
              {
                icon: "🛡️",
                title: "Bảo hành 5 năm",
                desc: "Cam kết bảo hành chính hãng 5 năm cho tất cả sản phẩm.",
              },
            ].map((f) => (
              <div key={f.title} className="home__feature">
                <span>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home__cta">
        <div className="home__cta-inner">
          <h2>Bạn cần tư vấn thiết kế nội thất?</h2>
          <p>Đội ngũ chuyên gia sẵn sàng hỗ trợ 7 ngày/tuần.</p>
          <Link to={ROUTES.USER.CONTACT} className="btn btn--white">
            Liên hệ ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
