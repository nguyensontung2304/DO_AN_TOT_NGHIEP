import "./changePassword.scss";

// Ô nhập mật khẩu có nút hiện/ẩn.
// Tách riêng thành component để không định nghĩa component trong lúc render.
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
    <div className="form-group">
      <label htmlFor={id}>{label}</label>

      <div className="profile-pw-wrap">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />

        <button
          type="button"
          className="profile-pw-toggle"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}
