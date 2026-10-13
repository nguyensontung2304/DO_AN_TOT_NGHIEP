import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/router";

const ROUTE_PERMISSION_MAP = {
  [ROUTES.ADMIN.DASHBOARD]: "dashboard",
  [ROUTES.ADMIN.ORDERS]: "orders",
  [ROUTES.ADMIN.TECHNICAL]: "technical",
  [ROUTES.ADMIN.WAREHOUSE]: "warehouse",
  [ROUTES.ADMIN.PURCHASING]: "purchasing",
  [ROUTES.ADMIN.FACTORY]: "factory",
  [ROUTES.ADMIN.FINISHED_GOODS]: "finished_goods",
  [ROUTES.ADMIN.PRODUCTS]: "products",
  [ROUTES.ADMIN.CHAT]: "chat",
};

const COMPONENT_ROUTE_MAP = {
  dashboard: ROUTES.ADMIN.DASHBOARD,
  orders: ROUTES.ADMIN.ORDERS,
  technical: ROUTES.ADMIN.TECHNICAL,
  warehouse: ROUTES.ADMIN.WAREHOUSE,
  purchasing: ROUTES.ADMIN.PURCHASING,
  factory: ROUTES.ADMIN.FACTORY,
  finished_goods: ROUTES.ADMIN.FINISHED_GOODS,
  products: ROUTES.ADMIN.PRODUCTS,
  chat: ROUTES.ADMIN.CHAT,
};

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

  // Kiểm tra quyền hạn theo từng component đối với admin bộ phận
  const isRootAdmin =
    currentUser?.isRootAdmin === true ||
    currentUser?.is_root_admin === true ||
    currentUser?.email?.toLowerCase() === "admin@gmail.com";

  if (currentUser && !isRootAdmin) {
    const permissions = Array.isArray(currentUser.permissions)
      ? currentUser.permissions
      : [];

    const requiredPermission = ROUTE_PERMISSION_MAP[location.pathname];

    if (requiredPermission && !permissions.includes(requiredPermission)) {
      const firstAllowedCode = permissions[0];
      const fallbackRoute =
        (firstAllowedCode && COMPONENT_ROUTE_MAP[firstAllowedCode]) ||
        ROUTES.USER.HOME;

      return <Navigate to={fallbackRoute} replace />;
    }
  }

  return <Outlet />;
}
