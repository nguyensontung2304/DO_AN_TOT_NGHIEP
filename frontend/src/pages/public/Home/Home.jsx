import {
  Sofa,
  TreePine,
  Palette,
  Truck,
  Trophy,
  BadgeDollarSign,
  ShieldCheck,
  ArrowRight,
  ShoppingCart,
  LockKeyhole,
  Check,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { getProducts, getCategories, addToCart } from "../../../api";

import { ROUTES, getPath } from "../../../constants/router";

import "./home.scss";

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
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err.response?.data || err);
    }
  };

  return (
    <div className="home-products-inner-category-list-product">
      {product.badge && (
        <span className="home-products-inner-category-list-product-badge">
          {product.badge}
        </span>
      )}

      <Link
        to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
          id: product.id,
        })}
        className="home-products-inner-category-list-product-image"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <img src={product.image} alt={product.name} />
      </Link>

      <div className="home-products-inner-category-list-product-body">
        <span className="home-products-inner-category-list-product-body-category">
          {product.categoryName}
        </span>

        <h3 className="home-products-inner-category-list-product-body-name">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
          >
            {product.name}
          </Link>
        </h3>

        <p className="home-products-inner-category-list-product-body-description">
          {product.description}
        </p>

        <div className="home-products-inner-category-list-product-body-price">
          <strong>{Number(product.price).toLocaleString("vi-VN")}₫</strong>

          {product.old_price && (
            <>
              <s>{Number(product.old_price).toLocaleString("vi-VN")}₫</s>

              <span className="home-products-inner-category-list-product-body-price-discount">
                -
                {Math.round(
                  (1 - Number(product.price) / Number(product.old_price)) * 100,
                )}
                %
              </span>
            </>
          )}
        </div>

        <div className="home-products-inner-category-list-product-body-evaluate">
          <span className="home-products-inner-category-list-product-body-evaluate-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="home-products-inner-category-list-product-body-evaluate-item-icon"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>

            {product.commentsCount || 0}
          </span>

          <span className="home-products-inner-category-list-product-body-evaluate-item">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="home-products-inner-category-list-product-body-evaluate-item-icon"
            >
              <path d="m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17.03l-5.5 2.89 1.05-6.12L3.1 9.47l6.15-.9L12 3Z" />
            </svg>

            {product.ratingsCount || 0}
          </span>
        </div>

        <div className="home-products-inner-category-list-product-body-buttons">
          <Link
            to={getPath(ROUTES.USER.PRODUCT_DETAIL, {
              id: product.id,
            })}
            className="home-products-inner-category-list-product-body-buttons-detail"
          >
            Chi tiết
          </Link>

          {currentUser ? (
            <button
              className={`home-products-inner-category-list-product-body-buttons-cart ${
                added
                  ? "home-products-inner-category-list-product-body-buttons-cart-added"
                  : ""
              }`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check size={15} />
                  Đã thêm
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  Thêm giỏ
                </>
              )}
            </button>
          ) : (
            <Link
              to={ROUTES.USER.LOGIN}
              className="home-products-inner-category-list-product-body-buttons-cart home-products-inner-category-list-product-body-buttons-cart-guest"
              state={{ from: ROUTES.USER.HOME }}
            >
              <LockKeyhole size={15} />
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// CATEGORY SECTION
function CategorySection({ categoryName, products, onViewMore }) {
  console.log(products);

  const displayed = products.slice(0, 4);

  return (
    <div
      className="home-products-inner-category"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="300"
    >
      <div className="home-products-inner-category-header">
        <h2 className="home-products-inner-category-header-title">
          {categoryName}
        </h2>

        <button
          className="home-products-inner-category-header-button"
          onClick={() => onViewMore(categoryName)}
        >
          Xem thêm
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="home-products-inner-category-list">
        {displayed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// HOME
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

        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({
            limit: 200,
          }),
          getCategories(),
        ]);

        const productData = productsRes.data;
        const categoryData = categoriesRes.data;

        console.log("Products:", productData);
        console.log("Categories:", categoryData);

        setAllProducts(
          Array.isArray(productData.products) ? productData.products : [],
        );

        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch {
        setError("Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const grouped = categories.reduce((acc, category) => {
    acc[category.id] = allProducts.filter(
      (product) => product.categoryId === category.id,
    );

    return acc;
  }, {});

  const displayedCategories = categories.slice(0, 7);

  const handleViewMore = (categoryName) => {
    navigate(
      `${ROUTES.USER.PRODUCT_LIST}?category=${encodeURIComponent(
        categoryName,
      )}`,
    );
  };

  return (
    <div className="home">
      {/* INTRO BANNER */}
      <section className="home-banner">
        <div className="home-banner-overlay">
          <div className="home-banner-overlay-content">
            <span className="home-banner-overlay-content-brand">
              NỘI THẤT{" "}
              <em className="home-banner-overlay-content-brand-name">VIỆT</em>
            </span>

            <h1 className="home-banner-overlay-content-title">
              Không gian sống đẹp hơn mỗi ngày
            </h1>

            <p className="home-banner-overlay-content-description">
              Nội thất chất lượng – Thiết kế tinh tế – Kiến tạo tổ ấm Việt
            </p>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="home-hero">
        <div
          className="home-hero-content"
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          <span className="home-hero-content-tag">
            Nội thất cao cấp — trực tiếp từ xưởng
          </span>

          <h1 className="home-hero-content-title">
            Không gian sống
            <br />
            <span>đẹp hơn mỗi ngày</span>
          </h1>

          <p className="home-hero-content-description">
            32 mẫu bàn, ghế, tủ, kệ, sofa được thiết kế tinh tế — chất lượng bền
            vững, giao hàng lắp đặt tận nhà.
          </p>

          <div className="home-hero-content-buttons">
            <Link
              to={ROUTES.USER.PRODUCT_LIST}
              className="home-hero-content-buttons-primary"
            >
              Xem sản phẩm
              <ArrowRight size={18} />
            </Link>

            <Link
              to={ROUTES.USER.CONTACT}
              className="home-hero-content-buttons-outline"
            >
              Tư vấn miễn phí
            </Link>
          </div>
        </div>

        <div
          className="home-hero-visual"
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-delay="300"
        >
          {[
            {
              icon: Sofa,
              label: "Sofa cao cấp",
              span: "Êm ái & Sang trọng",
            },
            {
              icon: TreePine,
              label: "Gỗ tự nhiên",
              span: "100% Gỗ thật",
            },
            {
              icon: Palette,
              label: "Thiết kế độc quyền",
              span: "Mẫu mã duy nhất",
            },
            {
              icon: Truck,
              label: "Giao lắp tận nhà",
              span: "Miễn phí vận chuyển",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className={`home-hero-visual-card home-hero-visual-card-${index}`}
              >
                <div className="home-hero-visual-card-icon">
                  <Icon size={28} strokeWidth={1.8} />
                </div>

                <p className="home-hero-visual-card-title">{item.label}</p>

                <span className="home-hero-visual-card-description">
                  {item.span}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* STATS */}
      <section
        className="home-stats"
        data-aos="fade-down"
        data-aos-duration="1000"
        data-aos-delay="300"
      >
        <div className="home-stats-inner">
          {[
            {
              value: "32+",
              label: "Mẫu sản phẩm",
            },
            {
              value: "10.000+",
              label: "Khách hàng hài lòng",
            },
            {
              value: "15 năm",
              label: "Kinh nghiệm",
            },
            {
              value: "100%",
              label: "Bảo hành chính hãng",
            },
          ].map((stat) => (
            <div key={stat.label} className="home-stats-inner-item">
              <strong className="home-stats-inner-item-value">
                {stat.value}
              </strong>

              <span className="home-stats-inner-item-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="home-products" id="products">
        <div className="home-products-inner">
          <div
            className="home-products-inner-heading"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <span className="home-products-inner-heading-eyebrow">
              BỘ SƯU TẬP CHO KHÔNG GIAN SỐNG
            </span>

            <h2 className="home-products-inner-heading-title">
              Khám phá sản phẩm theo danh mục
            </h2>
          </div>

          {loading ? (
            <div className="home-products-inner-status">
              <Clock3 size={42} />
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="home-products-inner-status">
              <AlertCircle size={42} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="home-products-inner-categories">
              {displayedCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  categoryName={category.name}
                  products={grouped[category.id] || []}
                  onViewMore={handleViewMore}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <div className="home-features-inner">
          <div
            className="home-features-inner-heading"
            data-aos="fade-down"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            <span className="home-features-inner-heading-eyebrow">
              ĐIỂM TỰA CHO NGÔI NHÀ HOÀN MỸ
            </span>

            <h2 className="home-features-inner-heading-title">
              Tại sao chọn Nội Thất Việt?
            </h2>
          </div>

          <div
            className="home-features-inner-list"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-delay="300"
          >
            {[
              {
                icon: Trophy,
                title: "Chất lượng cao cấp",
                desc: "Nguyên liệu gỗ tự nhiên và kim loại cao cấp đạt tiêu chuẩn quốc tế.",
              },
              {
                icon: BadgeDollarSign,
                title: "Giá cả hợp lý",
                desc: "Trực tiếp từ xưởng sản xuất, không qua trung gian — tiết kiệm 20–40%.",
              },
              {
                icon: Truck,
                title: "Giao hàng toàn quốc",
                desc: "Lắp đặt tận nhà miễn phí trong 50km từ TP. HCM.",
              },
              {
                icon: ShieldCheck,
                title: "Bảo hành 5 năm",
                desc: "Cam kết bảo hành chính hãng 5 năm cho tất cả sản phẩm.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`home-features-inner-list-item home-features-inner-list-item-${index}`}
                >
                  <div className="home-features-inner-list-item-icon">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>

                  <h3 className="home-features-inner-list-item-title">
                    {feature.title}
                  </h3>

                  <p className="home-features-inner-list-item-description">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="300"
        tion
        className="home-cta"
      >
        <div className="home-cta-inner">
          <span className="home-cta-inner-eyebrow">
            ĐỘI NGŨ NỘI THẤT VIỆT LUÔN SẴN SÀNG
          </span>

          <h2 className="home-cta-inner-title">
            Bạn cần tư vấn thiết kế nội thất?
          </h2>

          <p className="home-cta-inner-description">
            Đội ngũ chuyên gia sẵn sàng hỗ trợ 7 ngày/tuần.
          </p>

          <Link to={ROUTES.USER.CONTACT} className="home-cta-inner-button">
            Liên hệ ngay
            <ArrowRight size={18} className="home-cta-inner-button-icon" />
          </Link>
        </div>
      </section>
    </div>
  );
}
