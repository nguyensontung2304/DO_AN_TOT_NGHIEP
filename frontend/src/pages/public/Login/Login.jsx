import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../../api/authApi";
import { setUser } from "../../../redux/userSlice";

import { ROUTES } from "../../../constants/router";
import "./login.scss";

const ADMIN_COMPONENT_PATHS = {
  dashboard: "/admin",
  orders: "/admin/orders",
  technical: "/admin/technical",
  warehouse: "/admin/warehouse",
  purchasing: "/admin/purchasing",
  factory: "/admin/factory",
  finished_goods: "/admin/finished-goods",
  products: "/admin/products",
  chat: "/admin/chat",
};

// Danh sách hình ảnh background tự động chuyển đổi sau mỗi 4 giây
const BRAND_IMAGES = [
  "/images/brand1.jpeg",
  "/images/brand2.jpeg",
  "/images/brand3.jpeg",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.USER.HOME;
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
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

  // Chuyển hướng sau khi đăng nhập thành công hoặc đã đăng nhập
  useEffect(() => {
    if (!currentUser?.id) return;

    if (currentUser.role === "admin") {
      const isRoot =
        currentUser.isRootAdmin === true ||
        currentUser.is_root_admin === true ||
        currentUser.email?.toLowerCase() === "admin@gmail.com";

      const permissions = Array.isArray(currentUser.permissions)
        ? currentUser.permissions
        : [];

      let targetPath = ROUTES.ADMIN.DASHBOARD;

      if (!isRoot) {
        const firstAllowedPath = permissions
          .map((code) => ADMIN_COMPONENT_PATHS[code])
          .find(Boolean);

        if (!firstAllowedPath) {
          navigate(ROUTES.USER.HOME, { replace: true });
          return;
        }

        targetPath = firstAllowedPath;
      }

      navigate(targetPath, { replace: true });
      return;
    }

    if (from.startsWith("/admin")) {
      navigate(ROUTES.USER.HOME, { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  }, [currentUser, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({
        email: form.email,
        password: form.password,
      });

      const user = response.data.user;

      localStorage.setItem("userId", JSON.stringify(user.id));
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userRole", user.role || "user");

      dispatch(setUser(user));
      window.dispatchEvent(new Event("userChanged"));
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      {/* BÊN TRÁI - BRAND & SLIDER ẢNH */}
      <div className="login-brand">
        {BRAND_IMAGES.map((imgSrc, index) => (
          <img
            key={index}
            src={imgSrc}
            alt="Nội Thất Việt"
            className={`login-brand-image ${
              index === currentImageIndex ? "active" : ""
            }`}
          />
        ))}
      </div>

      {/* BÊN PHẢI - PANEL */}
      <div className="login-panel">
        <div className="login-card">
          <button
            className="login-back"
            type="button"
            onClick={() => navigate(ROUTES.USER.HOME)}
          >
            <ArrowLeft size={18} /> Về trang chủ
          </button>

          <div className="login-logo">
            <div className="login-logo-image">
              <img
                src="/images/logo.jpeg"
                alt="Nội Thất Việt"
                className="login-logo-image-img"
              />
            </div>

            <span className="login-logo-text">
              <strong className="login-logo-text-strong">Nội Thất</strong>
              <em className="login-logo-text-em"> Việt</em>
            </span>

            <p className="login-logo-description">Đăng nhập để đặt hàng</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label className="login-form-group-label" htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                className="login-form-group-input"
                type="email"
                name="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
                placeholder="email@example.com"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <div className="login-form-group">
              <label
                className="login-form-group-label"
                htmlFor="login-password"
              >
                Mật khẩu
              </label>

              <input
                id="login-password"
                className="login-form-group-input"
                type="password"
                name="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    password: e.target.value,
                  }))
                }
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p className="login-switch">
            <Link to={ROUTES.USER.FORGOT_PASSWORD}>Quên mật khẩu?</Link>
          </p>

          <p className="login-switch">
            Chưa có tài khoản?{" "}
            <Link to={ROUTES.USER.REGISTER}>Đăng ký miễn phí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
