import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getProducts, addToCart } from "../../../api";

import { ROUTES, getPath } from "../../../constants/router";

import "./products.scss";

const PRODUCTS_PER_PAGE = 12;

const ALL_CATEGORY = "Tất cả";
const DEFAULT_SORT = "default";

// PRODUCT CARD
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);

  console.log(product);

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
        to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
          id: product.id,
        })}
        className="product-card__img"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>Không có ảnh</span>
        )}
      </Link>

      <div className="product-card__body">
        <span className="product-card__cat">{product.categoryName}</span>

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
            <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
          )}

          {discount && (
            <span className="product-card__discount">-{discount}%</span>
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
              <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />
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
              state={{
                from: ROUTES.USER.PRODUCT_LIST,
              }}
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Toàn bộ bộ lọc lấy từ query string ────────────────────────────────────
  // URL là nguồn duy nhất: F5, copy link hay nút back đều giữ nguyên bộ lọc,
  // và link do footer/Home tạo ra mở thẳng được danh mục tương ứng.
  const activeCategory = searchParams.get("category") || ALL_CATEGORY;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || DEFAULT_SORT;
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // Ghi bộ lọc mới lên URL. Giá trị rỗng sẽ bị xoá khỏi query cho URL gọn.
  const updateParams = (patch, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    // replace: gõ tìm kiếm không nhét mỗi chữ cái vào history
    setSearchParams(next, { replace });
  };

  // Tổng số sản phẩm sau khi BE lọc
  const [total, setTotal] = useState(0);

  // Tổng số trang do BE tính
  const [totalPages, setTotalPages] = useState(1);

  // Danh sách category do BE trả về
  const [categories, setCategories] = useState([]);

  // GET PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await getProducts({
          category: activeCategory === ALL_CATEGORY ? "" : activeCategory,

          search: search.trim(),

          sort: sortBy,

          page: currentPage,

          limit: PRODUCTS_PER_PAGE,
        });

        const data = response.data;

        console.log("=======> GET PRODUCTS:", response);

        // Products
        setProducts(Array.isArray(data.products) ? data.products : []);

        // Total
        setTotal(Number(data.total) || 0);

        // Total pages
        setTotalPages(Number(data.totalPages) || 1);

        // Categories
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);

        setError("Không thể tải danh sách sản phẩm");

        setProducts([]);

        setTotal(0);

        setTotalPages(1);

        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory, search, sortBy, currentPage]);

  // CHUYỂN TRANG
  const goToPage = (page) => {
    updateParams({ page: page === 1 ? "" : page });
  };

  // TẠO DANH SÁCH SỐ TRANG
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    const delta = 2;

    const left = currentPage - delta;

    const right = currentPage + delta;

    pages.push(1);

    if (left > 2) {
      pages.push("...");
    }

    for (let i = Math.max(2, left); i <= Math.min(totalPages - 1, right); i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("...");
    }

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

  // RENDER
  return (
    <div className="products-page">
      {/* Intro Banner */}
      <section className="product-intro">
        <div className="product-intro__overlay">
          <div className="product-intro__content">
            <span>
              NỘI THẤT <em>VIỆT</em>
            </span>

            <h1>Sáng tạo không gian - Thổi hồn vào sản phẩm</h1>

            <p>
              Thiết kế độc đáo - Đẳng cấp - Mang đậm dấu ấn cá nhân cho từng
              ngôi nhà.
            </p>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="products-page__hero">
        <div className="products-page__hero-inner">
          <span>VỀ CHÚNG TÔI</span>

          <h1>Tất cả sản phẩm</h1>

          <p>{total} mẫu nội thất chất lượng cao</p>
        </div>
      </section>

      <div className="products-page__inner">
        {/* TOOLBAR */}
        <div className="products-toolbar">
          {/* SEARCH */}

          <div className="products-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => {
                // Tìm kiếm mới → về trang 1
                updateParams(
                  { search: e.target.value, page: "" },
                  { replace: true },
                );
              }}
            />

            {search && (
              <button
                onClick={() => {
                  updateParams({ search: "", page: "" });
                }}
                aria-label="Xóa"
              >
                ✕
              </button>
            )}
          </div>

          {/* SORT */}

          <select
            className="products-sort"
            value={sortBy}
            onChange={(e) => {
              // Sort mới → về trang 1
              updateParams({
                sort: e.target.value === DEFAULT_SORT ? "" : e.target.value,
                page: "",
              });
            }}
          >
            <option value="default">Sắp xếp mặc định</option>

            <option value="price-asc">Giá: Thấp → Cao</option>

            <option value="price-desc">Giá: Cao → Thấp</option>

            <option value="name">Tên A → Z</option>
          </select>
        </div>

        {/* CATEGORY */}
        <div className="products-cats">
          {/* TẤT CẢ */}

          <button
            className={`products-cat-btn ${
              activeCategory === ALL_CATEGORY ? "active" : ""
            }`}
            onClick={() => {
              updateParams({ category: "", page: "" });
            }}
          >
            Tất cả
            <span className="products-cat-count">{total}</span>
          </button>

          {/* CATEGORY TỪ BE */}

          {categories.map((category) => (
            <button
              key={category.name}
              className={`products-cat-btn ${
                activeCategory === category.name ? "active" : ""
              }`}
              onClick={() => {
                updateParams({
                  category: category.name === ALL_CATEGORY ? "" : category.name,
                  page: "",
                });
              }}
            >
              {category.name}

              <span className="products-cat-count">{category.count}</span>
            </button>
          ))}
        </div>

        {/* COUNT */}
        <p className="products-result-count">
          {total === 0
            ? "Không có sản phẩm nào"
            : `Hiển thị ${products.length} / ${total} sản phẩm — Trang ${currentPage}/${totalPages}`}
        </p>

        {/* EMPTY */}
        {products.length === 0 ? (
          <div className="products-empty">
            <span>😕</span>

            <p>Không tìm thấy sản phẩm phù hợp.</p>

            <button
              className="btn-clear"
              onClick={() => {
                updateParams({
                  search: "",
                  category: "",
                  sort: "",
                  page: "",
                });
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            {/* PRODUCT GRID */}
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                {/* TRANG TRƯỚC */}

                <button
                  className="pagination__btn pagination__btn--nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  ‹
                </button>

                {/* SỐ TRANG */}

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
                      className={`pagination__btn ${
                        currentPage === page ? "pagination__btn--active" : ""
                      }`}
                      onClick={() => goToPage(page)}
                      aria-label={`Trang ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ),
                )}

                {/* TRANG TIẾP */}
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
