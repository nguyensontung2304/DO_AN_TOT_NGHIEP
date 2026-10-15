import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { changePassword } from "../../../../../api/authApi";
import PasswordField from "../../../../../components/public/PasswordField/PasswordField";
import "./changePassword.scss";

// 1. ĐÁNH GIÁ ĐỘ MẠNH MẬT KHẨU
function getStrength(password) {
  if (password.length >= 10) return "strong";
  if (password.length >= 6) return "medium";
  return "weak";
}

// 2. NỘI DUNG ĐỘ MẠNH
const STRENGTH_TEXT = {
  weak: "Yếu",
  medium: "Trung bình",
  strong: "Mạnh",
};

// 3. COMPONENT ĐỔI MẬT KHẨU
export default function ChangePassword() {
  // 3.1. STATE FORM
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 3.2. STATE THÔNG BÁO VÀ TRẠNG THÁI
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 3.3. STATE HIỆN / ẨN MẬT KHẨU
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // 3.4. CẬP NHẬT GIÁ TRỊ FORM
  const updateField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 3.5. HIỆN / ẨN MẬT KHẨU
  const toggleShow = (field) => () => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // 3.6. KIỂM TRA DỮ LIỆU
  const validate = () => {
    if (!form.currentPassword) {
      return "Vui lòng nhập mật khẩu hiện tại.";
    }

    if (form.newPassword.length < 6) {
      return "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }

    if (form.newPassword !== form.confirmPassword) {
      return "Mật khẩu xác nhận không khớp.";
    }

    if (form.currentPassword === form.newPassword) {
      return "Mật khẩu mới phải khác mật khẩu hiện tại.";
    }

    return null;
  };

  // 3.7. GỬI YÊU CẦU ĐỔI MẬT KHẨU
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

      setShow({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // 3.8. GIAO DIỆN FORM
  const strength = getStrength(form.newPassword);

  return (
    <form className="change-password" onSubmit={handleSubmit}>
      {/* 3.8.1. MẬT KHẨU HIỆN TẠI */}
      <PasswordField
        id="currentPassword"
        label="Mật khẩu hiện tại"
        value={form.currentPassword}
        onChange={updateField("currentPassword")}
        show={show.currentPassword}
        onToggle={toggleShow("currentPassword")}
        placeholder="Nhập mật khẩu hiện tại"
      />

      {/* 3.8.2. MẬT KHẨU MỚI */}
      <PasswordField
        id="newPassword"
        label="Mật khẩu mới"
        value={form.newPassword}
        onChange={updateField("newPassword")}
        show={show.newPassword}
        onToggle={toggleShow("newPassword")}
        placeholder="Tối thiểu 6 ký tự"
      />

      {/* 3.8.3. THANH ĐỘ MẠNH MẬT KHẨU */}
      {form.newPassword && (
        <div
          className={`change-password__strength change-password__strength--${strength}`}
          aria-live="polite"
        >
          <div
            className="change-password__strength-track"
            role="progressbar"
            aria-label="Độ mạnh mật khẩu"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={
              strength === "weak" ? 33 : strength === "medium" ? 66 : 100
            }
          >
            <div className="change-password__strength-bar" />
          </div>

          <span className="change-password__strength-text">
            {STRENGTH_TEXT[strength]}
          </span>
        </div>
      )}

      {/* 3.8.4. XÁC NHẬN MẬT KHẨU */}
      <PasswordField
        id="confirmPassword"
        label="Xác nhận mật khẩu mới"
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        show={show.confirmPassword}
        onToggle={toggleShow("confirmPassword")}
        placeholder="Nhập lại mật khẩu mới"
      />

      {/* 3.8.5. THÔNG BÁO LỖI */}
      {error && (
        <p
          className="change-password__message change-password__message--error"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* 3.8.6. THÔNG BÁO THÀNH CÔNG */}
      {success && (
        <p
          className="change-password__message change-password__message--success"
          role="status"
        >
          {success}
        </p>
      )}

      {/* 3.8.7. NÚT ĐỔI MẬT KHẨU */}
      <div className="change-password__actions">
        <button
          className="change-password__button"
          type="submit"
          disabled={loading}
        >
          <LockKeyhole size={18} strokeWidth={2} />
          <span>{loading ? "Đang xử lý..." : "Đổi mật khẩu"}</span>
        </button>
      </div>
    </form>
  );
}
