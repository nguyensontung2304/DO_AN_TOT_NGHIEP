import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { ROUTES } from "../../../constants/router";
import ProfileSidebar from "./components/ProfileSidebar/ProfileSidebar";
import ProfileInfo from "./components/ProfileInfo/ProfileInfo";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import AddressBook from "./components/AddressBook/AddressBook";

import "./profile.scss";

const TAB_TITLES = {
  info: "👤 Thông tin cá nhân",
  addressBook: "📍 Sổ địa chỉ",
  password: "🔒 Đổi mật khẩu",
};

// Trang hồ sơ.
// Việc kiểm tra đăng nhập do PrivateLayout đảm nhiệm trước khi render,
// nên ở đây chỉ cần ghép các component con theo tab đang chọn.

// Tab đang chọn được suy ra từ URL (/profile và /profile/change-password)
// chứ không giữ trong state: reload trang hay bấm nút back đều giữ đúng tab,
// và người dùng gửi link /profile/change-password thì mở thẳng tab đó.
export default function Profile() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const { pathname } = useLocation();

  const activeTab =
    pathname === ROUTES.USER.PROFILE_CHANGE_PASSWORD
      ? "password"
      : pathname === ROUTES.USER.PROFILE_ADDRESS_BOOK
        ? "addressBook"
        : "info";

  return (
    <div className="profile-page">
      <div className="profile-layout">
        <ProfileSidebar currentUser={currentUser} />

        <div className="profile-content">
          <h2 className="profile-content__title">{TAB_TITLES[activeTab]}</h2>

          {activeTab === "info" ? (
            <ProfileInfo key={currentUser.id} currentUser={currentUser} />
          ) : activeTab === "addressBook" ? (
            <AddressBook currentUser={currentUser} />
          ) : (
            <ChangePassword />
          )}
        </div>
      </div>
    </div>
  );
}
