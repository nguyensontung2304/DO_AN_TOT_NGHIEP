import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../constants/router";
import "./home.scss";

const PRODUCTS_PER_PAGE = 12;

//  ProductCard
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!currentUser?.id) {
      window.location.href = ROUTES.USER.LOGIN_USER;
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
      setTimeout(() => setAdded(false), 1800);
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
        to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: product.id })}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.emoji}
      </Link>

      <div className="product-card__body">
        <span className="product-card__cat">{product.category}</span>

        <h3 className="product-card__name">
          <Link to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: product.id })}>
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

        <div className="product-card__btns">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: product.id })}
            className="product-card__detail-btn"
          >
            Chi tiết
          </Link>

          {currentUser ? (
            <button
              className={`product-card__btn ${added ? "product-card__btn--added" : ""}`}
              onClick={handleAdd}
            >
              {added ? "✅ Đã thêm!" : "🛒 Thêm giỏ"}
            </button>
          ) : (
            <Link
              to={ROUTES.USER.LOGIN_USER}
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

//  Home
export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  //  Lấy sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  //  Reset về trang 1 khi filter / search / sort thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search, sortBy]);

  //  Danh mục
  const categories = [
    "Tất cả",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  //  Lọc
  let filtered = products.filter((p) => {
    const matchCat =
      activeCategory === "Tất cả" || p.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  //  Sắp xếp
  if (sortBy === "price-asc")
    filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  if (sortBy === "price-desc")
    filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  if (sortBy === "name")
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "vi"));

  //  Phân trang
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    // Cuộn lên section sản phẩm
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Tạo mảng số trang để render (luôn hiển thị tối đa 5 trang liên tiếp)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="home">
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
            <a href="#products" className="btn btn--primary">
              Xem sản phẩm
            </a>
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

      <section className="home__products-section" id="products">
        <div className="home__products-inner">
          <h2 className="home__section-title">Tất cả sản phẩm</h2>

          <div className="products-toolbar">
            <div className="products-search">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Xóa tìm kiếm">
                  ✕
                </button>
              )}
            </div>

            <select
              className="products-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="name">Tên A → Z</option>
            </select>
          </div>

          <div className="products-cats">
            {categories.map((cat) => {
              const count =
                cat === "Tất cả"
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`products-cat-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className="products-cat-count">{count}</span>
                </button>
              );
            })}
          </div>

          {!loading && !error && (
            <p className="products-result-count">
              {filtered.length === 0
                ? "Không có sản phẩm nào"
                : filtered.length === products.length
                  ? `Hiển thị ${paginated.length} / ${products.length} sản phẩm — Trang ${currentPage}/${totalPages}`
                  : `${filtered.length} sản phẩm${search ? ` cho "${search}"` : ""} — Trang ${currentPage}/${totalPages || 1}`}
            </p>
          )}

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
          ) : filtered.length === 0 ? (
            <div className="products-empty">
              <span>😕</span>
              <p>Không tìm thấy sản phẩm phù hợp.</p>
              <button
                className="btn btn--outline"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("Tất cả");
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {paginated.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination__btn pagination__btn--nav"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>

                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="pagination__ellipsis"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        className={`pagination__btn ${currentPage === page ? "pagination__btn--active" : ""}`}
                        onClick={() => goToPage(page)}
                        aria-label={`Trang ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    className="pagination__btn pagination__btn--nav"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Trang tiếp"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

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
