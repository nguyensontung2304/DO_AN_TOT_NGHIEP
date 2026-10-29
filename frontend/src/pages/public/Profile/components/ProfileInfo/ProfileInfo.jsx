import { useState } from "react";
import { UserRound } from "lucide-react";
import { useDispatch } from "react-redux";
import { updateMyProfile } from "../../../../../api/authApi";
import { setUser } from "../../../../../redux/userSlice";

import "./profileInfo.scss";

export default function ProfileInfo({ currentUser }) {
  const dispatch = useDispatch();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <form className="profile-info" onSubmit={handleSubmit}>
      <div className="profile-info-group">
        <label className="profile-info-label" htmlFor="profile-name">
          Họ và tên
        </label>

        <input
          className="profile-info-input"
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="profile-info-group">
        <label className="profile-info-label" htmlFor="profile-email">
          Email
        </label>

        <input
          className="profile-info-input profile-info-input-disabled"
          id="profile-email"
          type="email"
          value={currentUser?.email || ""}
          disabled
        />
      </div>

      <div className="profile-info-group">
        <label className="profile-info-label" htmlFor="profile-phone">
          Số điện thoại
        </label>

        <input
          className="profile-info-input"
          id="profile-phone"
          type="text"
          value={phone || ""}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
        />
      </div>

      {error && (
        <p className="profile-info-message profile-info-message-error">
          {error}
        </p>
      )}

      {success && (
        <p className="profile-info-message profile-info-message-success">
          {success}
        </p>
      )}

      <button
        className="profile-info-button public-button-gradient"
        type="submit"
        disabled={loading}
      >
        <UserRound size={18} strokeWidth={2} />
        {loading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
