import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Search,
  X,
  ShoppingCart,
  LockKeyhole,
  Clock,
  MessageCircle,
  Star,
  Frown,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../constants/router";

import "./products.scss";

const PRODUCTS_PER_PAGE = 12;

const ALL_CATEGORY = "Tất cả";
const DEFAULT_SORT = "default";

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
    <article className="product-card">
      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      <Link
        to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
          id: product.id,
        })}
        className="product-card__image"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>Không có ảnh</span>
        )}
      </Link>

      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>

        <h3 className="product-card__name">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
          >
            {product.name}
          </Link>
        </h3>

        <p className="product-card__description">{product.description}</p>

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
          <span className="product-card__evaluate-item">
            <MessageCircle className="product-card__evaluate-icon" />
            {product.commentsCount || 0}
          </span>

          <span className="product-card__evaluate-item">
            <Star className="product-card__evaluate-icon" />
            {product.ratingsCount || 0}
          </span>
        </div>

        <div className="product-card__buttons">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
            className="product-card__detail-button"
          >
            Chi tiết
          </Link>

          {currentUser ? (
            <button
              className={`product-card__button ${
                added ? "product-card__button--added" : ""
              }`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <CheckCircle size={16} />
                  Đã thêm!
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Thêm giỏ
                </>
              )}
            </button>
          ) : (
            <Link
              to={ROUTES.USER.LOGIN}
              state={{
                from: ROUTES.USER.PRODUCT_LIST,
              }}
              className="product-card__button product-card__button--guest"
            >
              <LockKeyhole size={15} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// PRODUCTS PAGE
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TOÀN BỘ BỘ LỌC LẤY TỪ QUERY STRING
  const activeCategory = searchParams.get("category") || ALL_CATEGORY;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || DEFAULT_SORT;
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // CẬP NHẬT QUERY STRING
  const updateParams = (patch, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace });
  };

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
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

        setProducts(Array.isArray(data.products) ? data.products : []);
        setTotal(Number(data.total) || 0);
        setTotalPages(Number(data.totalPages) || 1);
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
          <div className="products-page__empty">
            <Clock size={40} />
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
          <div className="products-page__empty">
            <Frown size={40} />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // RENDER
  return (
    <div className="products-page">
      {/* INTRO BANNER */}
      <section className="products-page__intro">
        <div className="products-page__intro-overlay">
          <div className="products-page__intro-content">
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
        <div className="products-page__toolbar">
          {/* SEARCH */}
          <div className="products-page__search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={search}
              onChange={(e) => {
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
                <X size={16} />
              </button>
            )}
          </div>

          {/* SORT */}
          <select
            className="products-page__sort"
            value={sortBy}
            onChange={(e) => {
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
        <div className="products-page__categories">
          <button
            className={`products-page__category-button ${
              activeCategory === ALL_CATEGORY
                ? "products-page__category-button--active"
                : ""
            }`}
            onClick={() => {
              updateParams({ category: "", page: "" });
            }}
          >
            Tất cả
            <span className="products-page__category-count">{total}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className={`products-page__category-button ${
                activeCategory === category.name
                  ? "products-page__category-button--active"
                  : ""
              }`}
              onClick={() => {
                updateParams({
                  category: category.name === ALL_CATEGORY ? "" : category.name,
                  page: "",
                });
              }}
            >
              {category.name}

              <span className="products-page__category-count">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* COUNT */}
        <p className="products-page__result-count">
          {total === 0
            ? "Không có sản phẩm nào"
            : `Hiển thị ${products.length} / ${total} sản phẩm — Trang ${currentPage}/${totalPages}`}
        </p>

        {/* EMPTY */}
        {products.length === 0 ? (
          <div className="products-page__empty">
            <Frown size={40} />

            <p>Không tìm thấy sản phẩm phù hợp.</p>

            <button
              className="products-page__clear-button"
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
            <div className="products-page__grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="products-page__pagination">
                <button
                  className="products-page__pagination-button products-page__pagination-button--nav"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={20} />
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="products-page__pagination-ellipsis"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`products-page__pagination-button ${
                        currentPage === page
                          ? "products-page__pagination-button--active"
                          : ""
                      }`}
                      onClick={() => goToPage(page)}
                      aria-label={`Trang ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="products-page__pagination-button products-page__pagination-button--nav"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang tiếp"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
