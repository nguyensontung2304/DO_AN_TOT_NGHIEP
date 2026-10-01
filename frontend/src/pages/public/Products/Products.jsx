import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { getProducts, addToCart } from "../../../api";

import { ROUTES, getPath } from "../../../constants/router";

import "./products.scss";

const PRODUCTS_PER_PAGE = 12;

// PRODUCT CARD
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
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Danh mục đang chọn — khởi tạo từ query param nếu có
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get("category") || "Tất cả",
  );

  // Đồng bộ khi query param thay đổi (navigate từ Home/Footer)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setActiveCategory(cat);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Từ khóa tìm kiếm
  const [search, setSearch] = useState("");

  // Kiểu sắp xếp
  const [sortBy, setSortBy] = useState("default");

  // Trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

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
          category: activeCategory === "Tất cả" ? "" : activeCategory,

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
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      {/* HERO */}
      <div className="products-page__hero">
        <h1>Tất cả sản phẩm</h1>

        <p>{total} mẫu nội thất chất lượng cao</p>
      </div>

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
                setSearch(e.target.value);

                // Tìm kiếm mới → về trang 1
                setCurrentPage(1);
              }}
            />

            {search && (
              <button
                onClick={() => {
                  setSearch("");

                  setCurrentPage(1);
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
              setSortBy(e.target.value);

              // Sort mới → về trang 1
              setCurrentPage(1);
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
              activeCategory === "Tất cả" ? "active" : ""
            }`}
            onClick={() => {
              setActiveCategory("Tất cả");

              setCurrentPage(1);
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
                setActiveCategory(category.name);

                setCurrentPage(1);
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
                setSearch("");

                setActiveCategory("Tất cả");

                setSortBy("default");

                setCurrentPage(1);
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
