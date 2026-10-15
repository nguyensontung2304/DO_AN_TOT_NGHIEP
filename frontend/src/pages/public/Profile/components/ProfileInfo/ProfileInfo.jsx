import { useState } from "react";
import { UserRound } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateMyProfile } from "../../../../../api/authApi";
import { setUser } from "../../../../../redux/userSlice";
import "./profileInfo.scss";

// 1. FORM THÔNG TIN CÁ NHÂN
export default function ProfileInfo({ currentUser }) {
  const dispatch = useDispatch();

  // 1.1. STATE THÔNG TIN
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");

  // 1.2. STATE THÔNG BÁO VÀ TRẠNG THÁI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 1.3. XỬ LÝ CẬP NHẬT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await updateMyProfile(currentUser.id, {
        name,
        phone,
      });

      dispatch(setUser(res.data.user));
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  // 1.4. GIAO DIỆN FORM
  return (
    <form className="profile-info" onSubmit={handleSubmit}>
      {/* 1.4.1. HỌ VÀ TÊN */}
      <div className="profile-info__group">
        <label className="profile-info__label" htmlFor="profile-name">
          Họ và tên
        </label>
        <input
          className="profile-info__input"
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập họ và tên"
          autoComplete="name"
          required
        />
      </div>

      {/* 1.4.2. EMAIL */}
      <div className="profile-info__group">
        <label className="profile-info__label" htmlFor="profile-email">
          Email
        </label>
        <input
          className="profile-info__input profile-info__input--disabled"
          id="profile-email"
          type="email"
          value={currentUser?.email || ""}
          autoComplete="email"
          disabled
        />
        <p className="profile-info__hint">Email không thể thay đổi.</p>
      </div>

      {/* 1.4.3. SỐ ĐIỆN THOẠI */}
      <div className="profile-info__group">
        <label className="profile-info__label" htmlFor="profile-phone">
          Số điện thoại
        </label>
        <input
          className="profile-info__input"
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
          autoComplete="tel"
        />
      </div>

      {/* 1.4.4. THÔNG BÁO */}
      {error && (
        <p
          className="profile-info__message profile-info__message--error"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="profile-info__message profile-info__message--success"
          role="status"
        >
          {success}
        </p>
      )}

      {/* 1.4.5. NÚT LƯU */}
      <div className="profile-info__actions">
        <button
          className="profile-info__button"
          type="submit"
          disabled={loading}
        >
          <UserRound size={18} />
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
