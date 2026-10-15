import { Eye, EyeOff } from "lucide-react";
import "./passwordField.scss";

// 1. COMPONENT Ô NHẬP MẬT KHẨU
export default function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}) {
  return (
    <div className="profile-pw-field">
      {/* 1.1. Nhãn ô nhập */}
      <label className="profile-pw-field__label" htmlFor={id}>
        {label}
      </label>

      {/* 1.2. Khung nhập mật khẩu */}
      <div className="profile-pw-field__wrap">
        <input
          className="profile-pw-field__input"
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />

        {/* 1.3. Nút hiện / ẩn mật khẩu */}
        <button
          className="profile-pw-field__toggle"
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={show}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
