import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/router";

// Layout route dành cho khách đã đăng nhập (giỏ hàng, hồ sơ...).
// Chưa đăng nhập → chuyển hướng sang trang đăng nhập.
// state.from giúp Login đưa người dùng quay lại đúng trang đang cần.
export default function PrivateLayout() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const location = useLocation();

  if (!currentUser) {
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