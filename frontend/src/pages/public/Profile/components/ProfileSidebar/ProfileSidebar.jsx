import { NavLink } from "react-router-dom";

import { ROUTES } from "../../../../../constants/router";
import AvatarUpload from "../AvatarUpload/AvatarUpload";

import "./profileSidebar.scss";

// Mỗi tab là 1 route riêng nên menu dùng NavLink:
// URL đổi theo, và nút back của trình duyệt quay lại đúng tab trước đó.
const TABS = [
  {
    key: "info",
    label: "👤 Thông tin cá nhân",
    to: ROUTES.USER.PROFILE,
  },
  {
    key: "addressBook",
    label: "📍 Sổ địa chỉ",
    to: ROUTES.USER.PROFILE_ADDRESS_BOOK,
  },
  {
    key: "password",
    label: "🔒 Đổi mật khẩu",
    to: ROUTES.USER.PROFILE_CHANGE_PASSWORD,
  },
];

// Cột bên trái: thông tin người dùng, ảnh đại diện và menu chuyển tab.
export default function ProfileSidebar({ currentUser }) {
  return (
    <aside className="profile-sidebar">
      <div className="profile-sidebar__info">
        <strong>{currentUser.name}</strong>
        <p>{currentUser.email}</p>
      </div>

      <AvatarUpload currentUser={currentUser} />

      <nav className="profile-sidebar__nav">
        {TABS.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            end
            className={({ isActive }) =>
              `profile-sidebar__item ${isActive ? "active" : ""}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
