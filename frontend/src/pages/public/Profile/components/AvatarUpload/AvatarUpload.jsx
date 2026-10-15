import { useState, useEffect } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateMyAvatar } from "../../../../../api/authApi";
import { setUser } from "../../../../../redux/userSlice";
import "./avatarUpload.scss";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Ảnh đại diện + nút đổi ảnh.
// Component này tự giữ ảnh xem trước, nên việc giải phóng URL
// cũng nằm gọn ở đây thay vì rải ở trang cha.
export default function AvatarUpload({ currentUser }) {
  const dispatch = useDispatch();

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Giải phóng URL ảnh xem trước khi đổi hoặc rời component
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Trả về thông báo lỗi nếu file không hợp lệ, ngược lại null
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.";
    }

    if (file.size > MAX_SIZE) {
      return "Ảnh không được vượt quá 4MB.";
    }

    return null;
  };

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const invalidMessage = validateFile(file);
    if (invalidMessage) {
      setError(invalidMessage);
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await updateMyAvatar(formData);

      // Backend trả trực tiếp user đã format
      dispatch(setUser(res.data));

      setPreview("");
      setSuccess("Cập nhật ảnh đại diện thành công!");
    } catch (err) {
      console.error("Lỗi upload avatar:", err);

      setPreview("");
      setError(
        err.response?.data?.message || "Không thể cập nhật ảnh đại diện.",
      );
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const avatarUrl = preview || currentUser?.avatar;

  return (
    <div className="profile-avatar-upload">
      <div className="profile-avatar">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Ảnh đại diện"
            className="profile-avatar__image"
          />
        ) : (
          currentUser?.name?.charAt(0).toUpperCase()
        )}
      </div>

      <label
        htmlFor="avatar-input"
        className={`profile-avatar-upload__button ${loading ? "disabled" : ""}`}
      >
        {loading ? (
          <>
            <LoaderCircle
              size={18}
              className="profile-avatar-upload__button-icon spinning"
            />
            Đang tải ảnh...
          </>
        ) : (
          <>
            <Camera size={18} className="profile-avatar-upload__button-icon" />
            Đổi ảnh đại diện
          </>
        )}
      </label>

      <input
        id="avatar-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={loading}
        hidden
      />

      <small>JPG, PNG, WEBP · Tối đa 4MB</small>

      {error && <p className="profile-error">{error}</p>}
      {success && <p className="profile-success">{success}</p>}
    </div>
  );
}
