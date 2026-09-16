import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router";

import "../LoginUser/LoginUser.scss";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      const user = response.data.user;
      console.log(user);

      window.dispatchEvent(new Event("userChanged"));

      navigate(ROUTES.USER.LOGIN_USER);
    } catch (error) {
      setError(error.response?.data?.message || "Đăng ký thất bại");
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
          <p>Tạo tài khoản để đặt hàng</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nguyễn Sơn Tùng"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="sontung@gmail.com"
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
              placeholder="Ít nhất 6 ký tự"
              required
            />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              value={form.confirm}
              onChange={(e) =>
                setForm((f) => ({ ...f, confirm: e.target.value }))
              }
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="login-switch">
          Đã có tài khoản?{" "}
          <Link to={ROUTES.USER.LOGIN_USER}>Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}
