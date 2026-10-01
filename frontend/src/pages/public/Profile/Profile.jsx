import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  updateMyProfile,
  changePassword,
  updateMyAvatar,
} from "../../../api/authApi";

import { setUser } from "../../../redux/userSlice";
import { ROUTES } from "../../../constants/router";

import "./profile.scss";

// ── Tab: Thông tin cá nhân ────────────────────────────────────────────────────
function InfoTab({ currentUser }) {
  const dispatch = useDispatch();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setAddress(currentUser.address || "");
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await updateMyProfile(currentUser.id, {
        name,
        phone,
        address,
      });

      dispatch(setUser(res.data.user));
      setSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <input type="email" value={currentUser?.email || ""} disabled />
      </div>

      <div className="form-group">
        <label>Số điện thoại</label>
        <input
          type="text"
          value={phone || ""}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
        />
      </div>

      <div className="form-group">
        <label>Địa chỉ</label>
        <textarea
          rows={3}
          value={address || ""}
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
  );
}

// ── Tab: Đổi mật khẩu ────────────────────────────────────────────────────────
function PasswordTab() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setSuccess("Đổi mật khẩu thành công!");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, field, show, onToggle, placeholder }) => (
    <div className="form-group">
      <label>{label}</label>

      <div className="profile-pw-wrap">
        <input
          type={show ? "text" : "password"}
          value={form[field]}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              [field]: e.target.value,
            }))
          }
          placeholder={placeholder}
          required
        />

        <button
          type="button"
          className="profile-pw-toggle"
          onClick={onToggle}
          tabIndex={-1}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <PasswordInput
        label="Mật khẩu hiện tại"
        field="currentPassword"
        show={showCurrent}
        onToggle={() => setShowCurrent((v) => !v)}
        placeholder="Nhập mật khẩu hiện tại"
      />

      <PasswordInput
        label="Mật khẩu mới"
        field="newPassword"
        show={showNew}
        onToggle={() => setShowNew((v) => !v)}
        placeholder="Tối thiểu 6 ký tự"
      />

      <PasswordInput
        label="Xác nhận mật khẩu mới"
        field="confirmPassword"
        show={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        placeholder="Nhập lại mật khẩu mới"
      />

      {form.newPassword && (
        <div className="profile-pw-strength">
          <div
            className={`profile-pw-bar ${
              form.newPassword.length >= 10
                ? "profile-pw-bar--strong"
                : form.newPassword.length >= 6
                  ? "profile-pw-bar--medium"
                  : "profile-pw-bar--weak"
            }`}
          />

          <span>
            {form.newPassword.length >= 10
              ? "Mạnh"
              : form.newPassword.length >= 6
                ? "Trung bình"
                : "Yếu"}
          </span>
        </div>
      )}

      {error && <p className="profile-error">{error}</p>}
      {success && <p className="profile-success">{success}</p>}

      <button className="profile-btn" type="submit" disabled={loading}>
        {loading ? "Đang xử lý..." : "🔒 Đổi mật khẩu"}
      </button>
    </form>
  );
}

// ── Main Profile ──────────────────────────────────────────────────────────────
const TABS = [
  { key: "info", label: "👤 Thông tin cá nhân" },
  { key: "password", label: "🔒 Đổi mật khẩu" },
];

export default function Profile() {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.user.currentUser);

  const [activeTab, setActiveTab] = useState("info");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

  // Giải phóng URL ảnh xem trước khi thay đổi hoặc rời component
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Xử lý chọn và upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarError("");
    setAvatarSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Ảnh không được vượt quá 5MB.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setLoadingAvatar(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateMyAvatar(formData);

      // Backend trả trực tiếp user đã format
      dispatch(setUser(res.data));

      setAvatarPreview("");
      setAvatarSuccess("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error("Lỗi upload avatar:", err);

      setAvatarPreview("");
      setAvatarError(
        err.response?.data?.message || "Không thể cập nhật ảnh đại diện.",
      );
    } finally {
      setLoadingAvatar(false);
      e.target.value = "";
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

  const avatarUrl = avatarPreview || currentUser.avatar;

  return (
    <div className="profile-page">
      <div className="profile-layout">
        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar__user">
            <div className="profile-avatar">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Ảnh đại diện"
                  className="profile-avatar__image"
                />
              ) : (
                currentUser.name?.charAt(0).toUpperCase()
              )}
            </div>

            <div className="profile-sidebar__info">
              <strong>{currentUser.name}</strong>
              <p>{currentUser.email}</p>
            </div>
          </div>

          {/* ── Upload avatar ── */}
          <div className="profile-avatar-upload">
            <label
              htmlFor="avatar-input"
              className={`profile-avatar-upload__button ${
                loadingAvatar ? "disabled" : ""
              }`}
            >
              {loadingAvatar ? "Đang tải ảnh..." : "📷 Đổi ảnh đại diện"}
            </label>

            <input
              id="avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={loadingAvatar}
              hidden
            />

            <small>JPG, PNG, WEBP · Tối đa 5MB</small>

            {avatarError && <p className="profile-error">{avatarError}</p>}

            {avatarSuccess && (
              <p className="profile-success">{avatarSuccess}</p>
            )}
          </div>

          {/* ── Navigation ── */}
          <nav className="profile-sidebar__nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`profile-sidebar__item ${
                  activeTab === tab.key ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="profile-content">
          <h2 className="profile-content__title">
            {TABS.find((t) => t.key === activeTab)?.label}
          </h2>

          {activeTab === "info" && <InfoTab currentUser={currentUser} />}

          {activeTab === "password" && <PasswordTab />}
        </div>
      </div>
    </div>
  );
}
