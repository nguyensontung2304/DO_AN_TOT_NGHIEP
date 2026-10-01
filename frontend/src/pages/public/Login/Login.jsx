import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../../../api/authApi";
import { setUser } from "../../../redux/userSlice";
import { ROUTES } from "../../../constants/router";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTES.USER.HOME;
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Quyết định chuyển hướng sau khi có user (đăng nhập thành công hoặc đã đăng nhập rồi)
  useEffect(() => {
    if (currentUser?.id) {
      if (currentUser?.role === "admin") {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      } else if (from.startsWith("/admin")) {
        // user thường không bao giờ được truy cập trang admin
        navigate(ROUTES.USER.HOME, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [currentUser?.id, currentUser?.role, from, navigate]);

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

      // Thông báo cho AppContext load ERP data (nếu là admin)
      window.dispatchEvent(new Event("userChanged"));

      // Điều hướng được xử lý bởi useEffect trên dựa trên role
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
      </div>
    </div>
  );
}
