import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/router";

// Layout route chỉ dành cho admin.
// Chưa đăng nhập hoặc không phải admin → chuyển hướng sang trang đăng nhập.
// Khi đăng nhập xong, Login sẽ đưa người dùng quay lại đúng trang đang cần.
export default function RequireAdmin() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const location = useLocation();

  const isAdmin =
    currentUser?.role === "admin" ||
    (localStorage.getItem("userRole") === "admin" &&
      !!localStorage.getItem("accessToken"));

  if (!isAdmin) {
    // state.from là đường dẫn (chuỗi) để Login đưa người dùng quay lại
    // đúng trang đang cần sau khi đăng nhập
    return (
      <Navigate
        to={ROUTES.USER.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}
