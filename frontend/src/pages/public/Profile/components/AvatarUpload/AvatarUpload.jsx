import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Camera } from "lucide-react";
import { updateMyAvatar } from "../../../../../api/authApi";
import { setUser } from "../../../../../redux/userSlice";
import "./avatarUpload.scss";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function AvatarUpload({ currentUser }) {
  const dispatch = useDispatch();

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Giải phóng URL ảnh xem trước khi thay đổi hoặc rời component
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Kiểm tra file ảnh
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.";
    }

    if (file.size > MAX_SIZE) {
      return "Ảnh không được vượt quá 5MB.";
    }

    return null;
  };

  // Xử lý chọn và tải ảnh
  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    console.log(file);

    if (!file) return;
    setError("");
    setSuccess("");
    const invalidMessage = validateFile(file);
    console.log(invalidMessage);

    if (invalidMessage) {
      setError(invalidMessage);
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    console.log(previewUrl);

    setPreview(previewUrl);
    setLoading(true);

    try {
      const formData = new FormData();
      console.log(formData);

      formData.append("avatar", file);
      console.log(formData);

      const res = await updateMyAvatar(formData);
      console.log(res);

      // Cập nhật thông tin người dùng trong Redux
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
    <div className="avatar-upload">
      {/* Ảnh đại diện */}
      <div className="avatar-upload-image">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Ảnh đại diện"
            className="avatar-upload-image-content"
          />
        ) : (
          currentUser?.name?.charAt(0).toUpperCase()
        )}
      </div>

      {/* Nút đổi ảnh */}
      <label
        htmlFor="avatar-upload-input"
        className={`avatar-upload-button ${
          loading ? "avatar-upload-button-disabled" : ""
        }`}
      >
        <Camera size={18} aria-hidden="true" />
        {loading ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
      </label>

      <input
        id="avatar-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={loading}
        hidden
      />

      {/* Hướng dẫn định dạng ảnh */}
      <small className="avatar-upload-hint">JPG, PNG, WEBP · Tối đa 5MB</small>

      {/* Thông báo */}
      {error && (
        <p className="avatar-upload-message avatar-upload-message-error">
          {error}
        </p>
      )}

      {success && (
        <p className="avatar-upload-message avatar-upload-message-success">
          {success}
        </p>
      )}
    </div>
  );
}
