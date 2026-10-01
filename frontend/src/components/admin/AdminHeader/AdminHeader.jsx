import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearUser } from "../../../redux/userSlice";
import { logout } from "../../../api/authApi";
import { useApp } from "../../../context/useApp";
import { ROUTES } from "../../../constants/router";

import "./adminHeader.scss";

const NAV_ITEMS = [
  { to: ROUTES.ADMIN.DASHBOARD, label: "Dashboard", icon: "📊" },
  { to: ROUTES.ADMIN.ORDERS, label: "Đơn hàng", icon: "📋" },
  { to: ROUTES.ADMIN.TECHNICAL, label: "Kỹ thuật", icon: "⚙️" },
  { to: ROUTES.ADMIN.WAREHOUSE, label: "Thủ kho", icon: "🏭" },
  { to: ROUTES.ADMIN.PURCHASING, label: "Mua hàng", icon: "🛒" },
  { to: ROUTES.ADMIN.FACTORY, label: "Nhà máy", icon: "🔧" },
  { to: ROUTES.ADMIN.FINISHED_GOODS, label: "Thành phẩm", icon: "📦" },
  { to: ROUTES.ADMIN.PRODUCTS, label: "Sản phẩm", icon: "🛋️" },
];

export default function AdminHeader() {
  const {
    orders,
    productionRequests,
    purchaseRequests,
    handoverOrders,
    designRequests,
  } = useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pendingPR = productionRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const pendingPurchase = purchaseRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const pendingHandover = handoverOrders.filter(
    (o) => o.status === "pending",
  ).length;
  const pendingDesign = designRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalAlerts =
    pendingPR +
    pendingPurchase +
    pendingHandover +
    pendingDesign +
    pendingOrders;

  const handleLogout = async () => {
    try {
      await logout(); // Xóa refresh_token trong DB
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    dispatch(clearUser());
    // Thông báo cho AppContext làm mới lại state ERP
    window.dispatchEvent(new Event("userChanged"));
    navigate(ROUTES.USER.HOME);
  };

  return (
    <header className="admin-header">
      <div className="admin-header__top">
        <div className="admin-header__brand">
          <span>🏭</span>
          <div>
            <strong>Kho Xưởng ERP</strong>
            <small>Hệ thống quản lý sản xuất</small>
          </div>
        </div>

        <div className="admin-header__right">
          {totalAlerts > 0 && (
            <span className="admin-header__alert">
              🔔 {totalAlerts} thông báo chờ xử lý
            </span>
          )}

          <div className="admin-header__user">
            <span className="admin-header__avatar">👤</span>
            <span className="admin-header__username">Admin</span>
          </div>

          <button className="admin-header__logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <nav className="admin-header__nav">
        {NAV_ITEMS.map(({ to, label, icon }) => {
          // badge count per nav item
          let badge = 0;
          if (to === ROUTES.ADMIN.ORDERS) badge = pendingOrders;
          if (to === ROUTES.ADMIN.WAREHOUSE)
            badge = pendingPR + pendingHandover;
          if (to === ROUTES.ADMIN.PURCHASING) badge = pendingPurchase;
          if (to === ROUTES.ADMIN.TECHNICAL) badge = pendingDesign;
          if (to === ROUTES.ADMIN.FACTORY) badge = pendingHandover;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN.DASHBOARD}
              className={({ isActive }) =>
                `admin-header__nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="admin-header__nav-icon">{icon}</span>
              <span>{label}</span>
              {badge > 0 && (
                <span className="admin-header__nav-badge">{badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
