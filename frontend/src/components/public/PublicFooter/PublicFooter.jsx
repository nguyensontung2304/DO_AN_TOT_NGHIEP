import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../../api/productApi";
import { ROUTES, getPath } from "../../../constants/router";
import "./publicFooter.scss";

export default function PublicFooter() {
  //  State sản phẩm theo danh mục
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // danh mục đang mở

  //  Lấy danh sách sản phẩm từ API khi mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);

        // Lấy danh sách danh mục duy nhất
        const cats = [...new Set(data.map((p) => p.category).filter(Boolean))];
        setCategories(cats);

        // Mặc định mở tab đầu tiên
        if (cats.length > 0) setActiveTab(cats[0]);
      } catch {
        // Không hiển thị lỗi ở footer — silent fail
      }
    };
    fetchProducts();
  }, []);

  //  Sản phẩm thuộc tab đang chọn (tối đa 4 sản phẩm)
  const tabProducts = products
    .filter((p) => p.category === activeTab)
    .slice(0, 4);

  return (
    <footer className="pub-footer">
      {/*  PHẦN TRÊN: PRODUCT SHOWCASE THEO DANH MỤC  */}
      {categories.length > 0 && (
        <div className="pub-footer__showcase">
          <div className="pub-footer__showcase-inner">
            {/* Tiêu đề + tabs danh mục */}
            <div className="pub-footer__showcase-header">
              <span className="pub-footer__showcase-title">
                🛋️ Khám phá sản phẩm
              </span>
              <div className="pub-footer__tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`pub-footer__tab ${activeTab === cat ? "active" : ""}`}
                    onClick={() =>
                      setActiveTab((prev) => (prev === cat ? null : cat))
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid sản phẩm — chỉ hiển thị khi activeTab có sản phẩm */}
            {activeTab && tabProducts.length > 0 && (
              <div className="pub-footer__products">
                {tabProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={getPath(ROUTES.USER.PRODUCT_DETAIL, { id: p.id })}
                    className="pub-footer__product-card"
                  >
                    <div className="pub-footer__product-img">{p.emoji}</div>
                    <div className="pub-footer__product-info">
                      <span className="pub-footer__product-name">{p.name}</span>
                      <span className="pub-footer__product-price">
                        {Number(p.price).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Nút xem tất cả danh mục */}
                <Link
                  to={ROUTES.USER.PRODUCT_LIST}
                  className="pub-footer__product-more"
                  state={{ category: activeTab }}
                >
                  <span>Xem tất cả {activeTab}</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/*  PHẦN CHÍNH: 4 CỘT THÔNG TIN  */}
      <div className="pub-footer__inner">
        {/* Cột 1: Thương hiệu */}
        <div className="pub-footer__brand">
          <span className="pub-footer__logo">🛋️ Nội Thất Việt</span>
          <p>
            Chuyên cung cấp nội thất cao cấp —<br />
            bàn, ghế, tủ, kệ cho mọi không gian sống.
          </p>
          <div className="pub-footer__socials">
            <a href="#" aria-label="Facebook">
              📘
            </a>
            <a href="#" aria-label="Zalo">
              💬
            </a>
            <a href="#" aria-label="Youtube">
              ▶️
            </a>
          </div>
        </div>

        {/* Cột 2: Sản phẩm */}
        <div className="pub-footer__col">
          <h4>Sản phẩm</h4>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Bàn ăn</Link>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Ghế sofa</Link>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Tủ quần áo</Link>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Kệ sách</Link>
          <Link to={ROUTES.USER.PRODUCT_LIST}>Giường ngủ</Link>
        </div>

        {/* Cột 3: Dịch vụ */}
        <div className="pub-footer__col">
          <h4>Dịch vụ</h4>
          <a href="#">Thiết kế nội thất</a>
          <a href="#">Lắp đặt tại nhà</a>
          <a href="#">Bảo hành sản phẩm</a>
          <Link to={ROUTES.USER.CONTACT}>Tư vấn miễn phí</Link>
        </div>

        {/* Cột 4: Liên hệ */}
        <div className="pub-footer__col">
          <h4>Liên hệ</h4>
          <p>📍 34/16 Đường Bắc Đẩu, TP. Đà Nẵng</p>
          <p>📞 0795 789 458</p>
          <p>✉️ nguyensontung@gmail.com</p>
          <p>⏰ T2–T7: 8h00 – 20h00</p>
        </div>
      </div>

      {/*  BOTTOM BAR  */}
      <div className="pub-footer__bottom">
        <p>© 2026 Nội Thất Việt. Bảo lưu mọi quyền.</p>
        <div className="pub-footer__bottom-links">
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản sử dụng</a>
        </div>
      </div>
    </footer>
  );
}
