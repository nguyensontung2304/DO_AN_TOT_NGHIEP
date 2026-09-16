import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../router";
import "./products.scss";

const PRODUCTS_PER_PAGE = 12;

// PRODUCT CARD
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
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error.response?.data || error);
    }
  };

  const discount = product.old_price
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

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
            <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
          )}
          {discount && (
            <span className="product-card__discount">-{discount}%</span>
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
              state={{ from: ROUTES.USER.PRODUCT_LIST }}
              className="product-card__btn product-card__btn--guest"
            >
              🔒 Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// PRODUCTS PAGE
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // GET PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
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

  // CATEGORY
  const categories = [
    "Tất cả",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  // FILTER
  let filtered = products.filter((item) => {
    const matchCategory =
      activeCategory === "Tất cả" || item.category === activeCategory;
    const matchSearch =
      search.trim() === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // SORT
  if (sortBy === "price-asc") {
    filtered = [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (sortBy === "price-desc") {
    filtered = [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  }
  if (sortBy === "name") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }

  // PHÂN TRANG
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // LOADING
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <span>⏳</span>
            <p>Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <span>😕</span>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Hero */}
      <div className="products-page__hero">
        <h1>Tất cả sản phẩm</h1>
        <p>{products.length} mẫu nội thất chất lượng cao</p>
      </div>

      <div className="products-page__inner">
        {/* Toolbar */}
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
              <button onClick={() => setSearch("")} aria-label="Xóa">
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

        {/* Category */}
        <div className="products-cats">
          {categories.map((category) => {
            const count =
              category === "Tất cả"
                ? products.length
                : products.filter((product) => product.category === category)
                    .length;
            return (
              <button
                key={category}
                className={`products-cat-btn ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
                <span className="products-cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Count + thông tin trang */}
        <p className="products-result-count">
          {filtered.length === 0
            ? "Không có sản phẩm nào"
            : filtered.length === products.length
              ? `Hiển thị ${paginated.length} / ${products.length} sản phẩm — Trang ${currentPage}/${totalPages}`
              : `${filtered.length} sản phẩm${search ? ` cho "${search}"` : ""} — Trang ${currentPage}/${totalPages || 1}`}
        </p>

        {/* Empty */}
        {filtered.length === 0 ? (
          <div className="products-empty">
            <span>😕</span>
            <p>Không tìm thấy sản phẩm phù hợp.</p>
            <button
              className="btn-clear"
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
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Phân trang */}
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
    </div>
  );
}
