import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/useApp";
import { ROUTES } from "../../../constants/router";

import "./loginAdmin.scss";

export default function LoginAdmin() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const loginUser = login(username, password);
      if (loginUser) {
        navigate(ROUTES.ADMIN.DASHBOARD);
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng.");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Back button */}
        <button
          className="login-back"
          onClick={() => navigate(ROUTES.USER.HOME)}
        >
          ← Về trang chủ
        </button>

        <div className="login-logo">
          <span className="login-logo-icon">🏭</span>
          <h1>Kho Xưởng ERP</h1>
          <p>Đăng nhập quản trị hệ thống</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập Admin"}
          </button>
        </form>

        <p className="login-hint">
          Demo: <strong>admin</strong> / <strong>admin123</strong>
        </p>

        <div className="login-divider">
          <span>hoặc</span>
        </div>

        <Link to={ROUTES.USER.LOGIN_USER} className="login-admin-link">
          🛒 Đăng nhập mua hàng (Khách)
        </Link>
      </div>
    </div>
  );
}
