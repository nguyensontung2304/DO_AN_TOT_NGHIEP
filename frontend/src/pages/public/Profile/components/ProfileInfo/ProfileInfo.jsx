import { useState } from "react";
import { useDispatch } from "react-redux";

import { updateMyProfile } from "../../../../../api/authApi";
import { setUser } from "../../../../../redux/userSlice";

import "./profileInfo.scss";

// Form thông tin cá nhân: họ tên, email (không sửa được), sđt, địa chỉ.
// Khởi tạo state thẳng từ currentUser; muốn nạp lại dữ liệu thì đổi user
// thì component cha chỉ cần đổi `key` để React dựng lại form này.
export default function ProfileInfo({ currentUser }) {
  const dispatch = useDispatch();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState(currentUser?.address || "");

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
        <label htmlFor="profile-name">Họ và tên</label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={currentUser?.email || ""}
          disabled
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-phone">Số điện thoại</label>
        <input
          id="profile-phone"
          type="text"
          value={phone || ""}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profile-address">Địa chỉ</label>
        <textarea
          id="profile-address"
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
