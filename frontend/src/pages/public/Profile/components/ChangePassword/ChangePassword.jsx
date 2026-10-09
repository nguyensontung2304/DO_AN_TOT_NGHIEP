import { useState } from "react";

import { changePassword } from "../../../../../api/authApi";

import PasswordField from "./PasswordField";
import "./changePassword.scss";

// Đánh giá độ mạnh: <6 yếu, 6–9 trung bình, >=10 mạnh
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

  // Kiểm tra dữ liệu trước khi gửi. Trả về lỗi hoặc null.
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
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <PasswordField
        id="currentPassword"
        label="Mật khẩu hiện tại"
        value={form.currentPassword}
        onChange={updateField("currentPassword")}
        show={show.currentPassword}
        onToggle={toggleShow("currentPassword")}
        placeholder="Nhập mật khẩu hiện tại"
      />

      <PasswordField
        id="newPassword"
        label="Mật khẩu mới"
        value={form.newPassword}
        onChange={updateField("newPassword")}
        show={show.newPassword}
        onToggle={toggleShow("newPassword")}
        placeholder="Tối thiểu 6 ký tự"
      />

      <PasswordField
        id="confirmPassword"
        label="Xác nhận mật khẩu mới"
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        show={show.confirmPassword}
        onToggle={toggleShow("confirmPassword")}
        placeholder="Nhập lại mật khẩu mới"
      />

      {form.newPassword && (
        <div className="profile-pw-strength">
          <div
            className={`profile-pw-bar profile-pw-bar--${getStrength(
              form.newPassword,
            )}`}
          />

          <span>{STRENGTH_TEXT[getStrength(form.newPassword)]}</span>
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
