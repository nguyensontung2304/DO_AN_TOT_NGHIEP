import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/router";
import "./publicFooter.scss";

// Danh mục sản phẩm trong footer — khớp với category thực trong DB
const FOOTER_CATEGORIES = [
  "Bàn ăn",
  "Ghế sofa",
  "Tủ quần áo",
  "Kệ sách",
  "Giường ngủ",
];

export default function PublicFooter() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`${ROUTES.USER.PRODUCT_LIST}?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <footer className="pub-footer">
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
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Zalo">💬</a>
            <a href="#" aria-label="Youtube">▶️</a>
          </div>
        </div>

        {/* Cột 2: Sản phẩm — navigate theo category + scroll to top */}
        <div className="pub-footer__col">
          <h4>Sản phẩm</h4>
          {FOOTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="pub-footer__cat-link"
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
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
