import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../../../api";
import { ROUTES } from "../../../constants/router";
import "./publicFooter.scss";

// Số danh mục hiển thị ở footer
const MAX_CATEGORIES = 6;

export default function PublicFooter() {
  const navigate = useNavigate();

  // Danh mục lấy động từ API.
  // Trước đây danh sách này viết cứng trong file, nên khi đổi tên danh mục ở DB
  // thì link footer dẫn tới trang không có sản phẩm nào.
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getProducts({ limit: 1 });
        const data = res.data;

        if (!cancelled) {
          setCategories(Array.isArray(data?.categories) ? data.categories : []);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục cho footer:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(
      `${ROUTES.USER.PRODUCT_LIST}?category=${encodeURIComponent(categoryName)}`,
    );
  };

  return (
    <footer className="pub-footer">
      {/*  PHẦN CHÍNH: 4 CỘT THÔNG TIN  */}
      <div className="pub-footer__inner">
        {/* Cột 1: Thương hiệu */}
        <div className="pub-footer__brand">
          <div className="pub-footer__logo">
            <img
              src="/images/logo.png"
              alt="Nguyễn Sơn Tùng"
              className="pub-footer__logo-image"
            />
            <span className="pub-footer__logo-text">
              <strong>Nội Thất</strong>
              <em> Việt</em>
            </span>
          </div>
          <p>
            Chuyên cung cấp nội thất cao cấp —<br />
            bàn, ghế, tủ, kệ cho mọi không gian sống.
          </p>
          <div className="pub-footer__socials">
            <a href="#" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebook} />
            </a>

            <a href="#" aria-label="Zalo">
              <FontAwesomeIcon icon={faComment} />
            </a>

            <a href="#" aria-label="Youtube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>

        {/* Cột 2: Sản phẩm — navigate theo category + scroll to top */}
        <div className="pub-footer__col">
          <h4>Sản phẩm</h4>
          {categories.slice(0, MAX_CATEGORIES).map((cat) => (
            <button
              key={cat.name}
              className="pub-footer__cat-link"
              onClick={() => handleCategoryClick(cat.name)}
            >
              {cat.name}
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
          <div className="pub-footer__col-contact">
            <MapPin size={18} strokeWidth={2} />
            34/16 Đường Bắc Đẩu, TP. Đà Nẵng
          </div>

          <div className="pub-footer__col-contact">
            <Phone size={18} strokeWidth={2} />
            0795 789 458
          </div>

          <div className="pub-footer__col-contact">
            <Mail size={18} strokeWidth={2} />
            nguyensontung@gmail.com
          </div>

          <div className="pub-footer__col-contact">
            <Clock size={18} strokeWidth={2} />
            T2–T7: 8h00 – 20h00
          </div>
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
