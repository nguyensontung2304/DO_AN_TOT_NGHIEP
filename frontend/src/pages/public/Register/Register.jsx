import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router";
import "./register.scss";

const BRAND_IMAGES = [
  "/images/brand1.jpeg",
  "/images/brand2.jpeg",
  "/images/brand3.jpeg",
];

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Tự động chuyển ảnh sau mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % BRAND_IMAGES.length,
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!isValidEmail(form.email)) {
      setError("Vui lòng nhập email đúng định dạng.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      const user = response.data.user;

      console.log(user);

      window.dispatchEvent(new Event("userChanged"));

      navigate(ROUTES.USER.LOGIN);
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      {/* BÊN TRÁI - BRAND & SLIDER ẢNH */}
      <div className="register-brand">
        {BRAND_IMAGES.map((imgSrc, index) => (
          <img
            key={index}
            src={imgSrc}
            alt="Nội Thất Việt"
            className={`register-brand-image ${
              index === currentImageIndex ? "active" : ""
            }`}
          />
        ))}
      </div>

      {/* BÊN PHẢI - PANEL */}
      <div className="register-panel">
        <div className="register-card">
          <button
            className="register-back"
            type="button"
            onClick={() => navigate(ROUTES.USER.HOME)}
          >
            <ArrowLeft size={18} /> Về trang chủ
          </button>

          <div className="register-logo">
            <div className="register-logo-image">
              <img
                src="/images/logo.jpeg"
                alt="Nội Thất Việt"
                className="register-logo-image-img"
              />
            </div>

            <span className="register-logo-text">
              <strong className="register-logo-text-strong">Nội Thất</strong>
              <em className="register-logo-text-em"> Việt</em>
            </span>

            <p className="register-logo-description">
              Tạo tài khoản để đặt hàng
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* HỌ VÀ TÊN */}
            <div className="register-form-group">
              <label
                className="register-form-group-label"
                htmlFor="register-name"
              >
                Họ và tên
              </label>

              <input
                id="register-name"
                className="register-form-group-input"
                type="text"
                name="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
                placeholder="Nguyễn Sơn Tùng"
                autoComplete="name"
                autoFocus
                required
              />
            </div>

            {/* EMAIL */}
            <div className="register-form-group">
              <label
                className="register-form-group-label"
                htmlFor="register-email"
              >
                Email
              </label>

              <input
                id="register-email"
                className="register-form-group-input"
                type="email"
                name="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
                placeholder="sontung@gmail.com"
                autoComplete="email"
                required
              />
            </div>

            {/* MẬT KHẨU */}
            <div className="register-form-group">
              <label
                className="register-form-group-label"
                htmlFor="register-password"
              >
                Mật khẩu
              </label>

              <input
                id="register-password"
                className="register-form-group-input"
                type="password"
                name="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    password: e.target.value,
                  }))
                }
                placeholder="Ít nhất 6 ký tự"
                autoComplete="new-password"
                required
              />
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="register-form-group">
              <label
                className="register-form-group-label"
                htmlFor="register-confirm"
              >
                Xác nhận mật khẩu
              </label>

              <input
                id="register-confirm"
                className="register-form-group-input"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    confirm: e.target.value,
                  }))
                }
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                required
              />
            </div>

            {/* THÔNG BÁO LỖI */}
            {error && (
              <p className="register-error" role="alert">
                {error}
              </p>
            )}

            {/* NÚT ĐĂNG KÝ */}
            <button
              className="register-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* CHUYỂN SANG LOGIN */}
          <p className="register-switch">
            Đã có tài khoản? <Link to={ROUTES.USER.LOGIN}>Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
