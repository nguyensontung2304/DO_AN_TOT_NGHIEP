import { useState } from "react";
import { LockKeyhole } from "lucide-react";

import { changePassword } from "../../../../../api/authApi";
import PasswordField from "../../../../../components/public/PasswordField/PasswordField";

import "./changePassword.scss";

// Đánh giá độ mạnh mật khẩu
function getStrength(password) {
  if (password.length >= 10) return "strong";
  if (password.length >= 6) return "medium";
  return "weak";
}

const STRENGTH_TEXT = {
  weak: "Yếu",
  medium: "Trung bình",
  strong: "Mạnh",
};

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const updateField = (field) => (value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleShow = (field) => () =>
    setShow((s) => ({ ...s, [field]: !s[field] }));

  // Kiểm tra dữ liệu trước khi gửi
  const validate = () => {
    if (form.newPassword.length < 6) {
      return "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }

    if (form.newPassword !== form.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const invalidMessage = validate();

    if (invalidMessage) {
      setError(invalidMessage);
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

  const strength = getStrength(form.newPassword);

  return (
    <form className="change-password" onSubmit={handleSubmit}>
      {/* Mật khẩu hiện tại */}
      <div className="change-password-field">
        <PasswordField
          id="currentPassword"
          label="Mật khẩu hiện tại"
          value={form.currentPassword}
          onChange={updateField("currentPassword")}
          show={show.currentPassword}
          onToggle={toggleShow("currentPassword")}
          placeholder="Nhập mật khẩu hiện tại"
        />
      </div>

      {/* Mật khẩu mới */}
      <div className="change-password-field">
        <PasswordField
          id="newPassword"
          label="Mật khẩu mới"
          value={form.newPassword}
          onChange={updateField("newPassword")}
          show={show.newPassword}
          onToggle={toggleShow("newPassword")}
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>

      {/* Thanh đánh giá độ mạnh */}
      {form.newPassword && (
        <div className="change-password-strength">
          <div
            className={`change-password-strength-bar change-password-strength-bar--${strength}`}
          >
            <div className="change-password-strength-progress" />
          </div>

          <span
            className={`change-password-strength-text change-password-strength-text--${strength}`}
          >
            {STRENGTH_TEXT[strength]}
          </span>
        </div>
      )}

      {/* Xác nhận mật khẩu */}
      <div className="change-password-field">
        <PasswordField
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
          value={form.confirmPassword}
          onChange={updateField("confirmPassword")}
          show={show.confirmPassword}
          onToggle={toggleShow("confirmPassword")}
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>

      {/* Thông báo */}
      {error && (
        <p className="change-password-message change-password-message-error">
          {error}
        </p>
      )}

      {success && (
        <p className="change-password-message change-password-message-success">
          {success}
        </p>
      )}

      {/* Nút đổi mật khẩu */}
      <button
        className="change-password-button"
        type="submit"
        disabled={loading}
      >
        <LockKeyhole size={18} strokeWidth={2} aria-hidden="true" />
        {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
