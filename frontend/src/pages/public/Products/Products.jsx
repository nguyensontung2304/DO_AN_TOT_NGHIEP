import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Frown,
  LockKeyhole,
  LoaderCircle,
  MessageCircle,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";

import { getProducts, addToCart } from "../../../api";
import { ROUTES, getPath } from "../../../constants/router";

import "./products.scss";

const PRODUCTS_PER_PAGE = 12;
const ALL_CATEGORY = "Tất cả";
const DEFAULT_SORT = "default";

// 1. THẺ SẢN PHẨM
function ProductCard({ product }) {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [added, setAdded] = useState(false);

  // 1.1. THÊM SẢN PHẨM VÀO GIỎ HÀNG
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

  // 1.2. TÍNH PHẦN TRĂM GIẢM GIÁ
  const discount = product.old_price
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

  // 1.3. GIAO DIỆN THẺ SẢN PHẨM
  return (
    <article className="product-card">
      {/* 1.3.1. NHÃN SẢN PHẨM */}
      {product.badge && (
        <span className="product-card__badge">{product.badge}</span>
      )}

      {/* 1.3.2. HÌNH ẢNH */}
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
          <span className="product-card__no-image">Không có ảnh</span>
        )}
      </Link>

      {/* 1.3.3. THÔNG TIN SẢN PHẨM */}
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

        {/* 1.3.4. GIÁ SẢN PHẨM */}
        <div className="product-card__price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>

          {product.old_price && (
            <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>
          )}

          {discount && (
            <span className="product-card__discount">-{discount}%</span>
          )}
        </div>

        {/* 1.3.5. ĐÁNH GIÁ VÀ BÌNH LUẬN */}
        <div className="product-card__stats">
          <span className="product-card__stat">
            <MessageCircle className="product-card__stat-icon" />
            <span>{product.commentsCount || 0}</span>
          </span>

          <span className="product-card__stat">
            <Star className="product-card__stat-icon" />
            <span>{product.ratingsCount || 0}</span>
          </span>
        </div>

        {/* 1.3.6. CÁC NÚT THAO TÁC */}
        <div className="product-card__actions">
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
              className={`product-card__cart-button ${
                added ? "product-card__cart-button--added" : ""
              }`}
              type="button"
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check className="product-card__button-icon" />
                  <span>Đã thêm!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="product-card__button-icon" />
                  <span>Thêm giỏ</span>
                </>
              )}
            </button>
          ) : (
            <Link
              to={ROUTES.USER.LOGIN}
              state={{
                from: ROUTES.USER.PRODUCT_LIST,
              }}
              className="product-card__cart-button product-card__cart-button--guest"
            >
              <LockKeyhole className="product-card__button-icon" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// 2. TRANG DANH SÁCH SẢN PHẨM
export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 2.1. STATE DỮ LIỆU
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  // 2.2. LẤY BỘ LỌC TỪ URL
  const activeCategory = searchParams.get("category") || ALL_CATEGORY;
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || DEFAULT_SORT;
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);

  // 2.3. CẬP NHẬT QUERY STRING
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

  // 2.4. LẤY DANH SÁCH SẢN PHẨM
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

  // 2.5. CHUYỂN TRANG
  const goToPage = (page) => {
    updateParams({ page: page === 1 ? "" : page });
  };

  // 2.6. TẠO DANH SÁCH SỐ TRANG
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

  // 2.7. TRẠNG THÁI ĐANG TẢI
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <LoaderCircle className="products-empty__icon products-empty__icon--loading" />
            <p className="products-empty__text">Đang tải sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2.8. TRẠNG THÁI LỖI
  if (error) {
    return (
      <div className="products-page">
        <div className="products-page__inner">
          <div className="products-empty">
            <Frown className="products-empty__icon" />
            <p className="products-empty__text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 2.9. GIAO DIỆN TRANG SẢN PHẨM
  return (
    <div className="products-page">
      {/* 2.9.1. BANNER GIỚI THIỆU */}
      <section className="products-page__intro">
        <div className="products-page__intro-overlay">
          <div className="products-page__intro-content">
            <span className="products-page__intro-content-brand">
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

      {/* 2.9.2. TIÊU ĐỀ TRANG */}
      <section className="products-page__hero">
        <div className="products-page__hero-inner">
          <span>VỀ CHÚNG TÔI</span>
          <h1>Tất cả sản phẩm</h1>
          <p>{total} mẫu nội thất chất lượng cao</p>
        </div>
      </section>

      <div className="products-page__inner">
        {/* 2.9.3. THANH TÌM KIẾM VÀ SẮP XẾP */}
        <div className="products-toolbar">
          <div className="products-search">
            <Search className="products-search__icon" />

            <input
              className="products-search__input"
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
                className="products-search__clear"
                type="button"
                onClick={() => {
                  updateParams({ search: "", page: "" });
                }}
                aria-label="Xóa nội dung tìm kiếm"
              >
                <X />
              </button>
            )}
          </div>

          <select
            className="products-sort"
            value={sortBy}
            onChange={(e) => {
              updateParams({
                sort: e.target.value === DEFAULT_SORT ? "" : e.target.value,
                page: "",
              });
            }}
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp → Cao</option>
            <option value="price-desc">Giá: Cao → Thấp</option>
            <option value="name">Tên A → Z</option>
          </select>
        </div>

        {/* 2.9.4. DANH MỤC SẢN PHẨM */}
        <div className="products-categories">
          <button
            className={`products-category ${
              activeCategory === ALL_CATEGORY ? "products-category--active" : ""
            }`}
            type="button"
            onClick={() => {
              updateParams({ category: "", page: "" });
            }}
          >
            <span>Tất cả</span>
            <span className="products-category__count">{total}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className={`products-category ${
                activeCategory === category.name
                  ? "products-category--active"
                  : ""
              }`}
              type="button"
              onClick={() => {
                updateParams({
                  category: category.name === ALL_CATEGORY ? "" : category.name,
                  page: "",
                });
              }}
            >
              <span>{category.name}</span>
              <span className="products-category__count">{category.count}</span>
            </button>
          ))}
        </div>

        {/* 2.9.5. SỐ LƯỢNG KẾT QUẢ */}
        <p className="products-result-count">
          {total === 0
            ? "Không có sản phẩm nào"
            : `Hiển thị ${products.length} / ${total} sản phẩm — Trang ${currentPage}/${totalPages}`}
        </p>

        {/* 2.9.6. DANH SÁCH HOẶC TRẠNG THÁI TRỐNG */}
        {products.length === 0 ? (
          <div className="products-empty">
            <Frown className="products-empty__icon" />
            <p className="products-empty__text">
              Không tìm thấy sản phẩm phù hợp.
            </p>

            <button
              className="products-empty__clear"
              type="button"
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
            {/* 2.9.7. LƯỚI SẢN PHẨM */}
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* 2.9.8. PHÂN TRANG */}
            {totalPages > 1 && (
              <nav className="products-pagination" aria-label="Phân trang">
                <button
                  className="products-pagination__button products-pagination__button--nav"
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Trang trước"
                >
                  <ChevronLeft />
                </button>

                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="products-pagination__ellipsis"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      className={`products-pagination__button ${
                        currentPage === page
                          ? "products-pagination__button--active"
                          : ""
                      }`}
                      type="button"
                      onClick={() => goToPage(page)}
                      aria-label={`Trang ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  className="products-pagination__button products-pagination__button--nav"
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Trang tiếp"
                >
                  <ChevronRight />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
