import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUserById } from "../../../api/authApi";
import { setUser } from "../../../redux/userSlice";
import { ROUTES } from "../../../constants/router";
import "./profile.scss";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser?.id) {
      setError("Bạn cần đăng nhập để cập nhật thông tin.");
      return;
    }

    setLoading(true);

    try {
      const response = await updateUserById(currentUser.id, {
        name,
        phone,
        address,
      });

      const updatedUser = response.data.user;

      dispatch(setUser(updatedUser));

      setSuccess("Cập nhật thông tin thành công!");

      setTimeout(() => {
        navigate(ROUTES.USER.HOME);
      }, 800);
    } catch (error) {
      setError(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <p>Bạn chưa đăng nhập.</p>
          <Link to={ROUTES.USER.LOGIN_USER} className="profile-link">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <h1>{currentUser.name}</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} disabled />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ nhận hàng"
            />
          </div>

          {error && <p className="profile-error">{error}</p>}

          {success && <p className="profile-success">{success}</p>}

          <button className="profile-btn" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>

        {/* <div className="profile-footer">
          <button
            className="profile-back"
            onClick={() => navigate(ROUTES.USER.HOME)}
            type="button"
          >
            ← Quay lại Trang chủ
          </button>
        </div> */}
      </div>
    </div>
  );
}
