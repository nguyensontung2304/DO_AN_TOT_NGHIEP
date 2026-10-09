import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../../api/authApi";
import { ROUTES } from "../../../constants/router";
import "./register.scss";

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
    <div className="register-page">
      {/* BÊN TRÁI - 65% */}
      <div className="register-brand">
        <img
          src="/images/brand.png"
          alt="Nguyễn Sơn Tùng"
          className="register-brand-image"
        />
      </div>

      {/* BÊN PHẢI - 35% */}
      <div className="register-panel">
        <div className="register-card">
          <button
            className="register-back"
            onClick={() => navigate(ROUTES.USER.HOME)}
          >
            ← Về trang chủ
          </button>

          <div className="register-logo">
            <div className="register-logo-image">
              <img
                src="/images/logo.png"
                alt="Nguyễn Sơn Tùng"
                className="register-logo-image"
              />
            </div>

            <span className="register-logo-text">
              <strong>Nội Thất</strong>
              <em> Việt</em>
            </span>

            <p>Tạo tài khoản để đặt hàng</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {/* HỌ VÀ TÊN */}
            <div className="register-form-group">
              <label>Họ và tên</label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
                placeholder="Nguyễn Sơn Tùng"
                autoFocus
                required
              />
            </div>

            {/* EMAIL */}
            <div className="register-form-group">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: e.target.value,
                  }))
                }
                placeholder="sontung@gmail.com"
                required
              />
            </div>

            {/* MẬT KHẨU */}
            <div className="register-form-group">
              <label>Mật khẩu</label>

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    password: e.target.value,
                  }))
                }
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="register-form-group">
              <label>Xác nhận mật khẩu</label>

              <input
                type="password"
                value={form.confirm}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    confirm: e.target.value,
                  }))
                }
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>

            {/* ERROR */}
            {error && <p className="register-error">{error}</p>}

            {/* BUTTON */}
            <button className="register-btn" type="submit" disabled={loading}>
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
