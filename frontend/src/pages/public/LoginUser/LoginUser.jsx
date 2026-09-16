import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { loginUser } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router";
import "./LoginUser.scss";

export default function LoginUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.USER.HOME;
  const currentUser = useSelector((state) => state.user.currentUser);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      navigate(from, { replace: true });
    }
  }, [currentUser?.id, from, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      const user = response.data.user;

      localStorage.setItem("userId", JSON.stringify(user.id));

      window.dispatchEvent(new Event("userChanged"));

      navigate(from, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button
          className="login-back"
          onClick={() => navigate(ROUTES.USER.HOME)}
        >
          ← Về trang chủ
        </button>

        <div className="login-logo">
          <span className="login-logo-icon">🛋️</span>
          <h1>Nội Thất Việt</h1>
          <p>Đăng nhập để đặt hàng</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="email@example.com"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="login-switch">
          Chưa có tài khoản?{" "}
          <Link to={ROUTES.USER.REGISTER}>Đăng ký miễn phí</Link>
        </p>

        <div className="login-divider">
          <span>hoặc</span>
        </div>

        <Link to={ROUTES.USER.LOGIN_ADMIN} className="login-admin-link">
          🏭 Đăng nhập quản trị (Admin)
        </Link>

        <p className="login-hint">
          Demo: <strong>demo@email.com</strong> / <strong>demo123</strong>
        </p>
      </div>
    </div>
  );
}
