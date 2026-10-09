import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  BarChart2,
  ClipboardList,
  Settings,
  Warehouse,
  ShoppingCart,
  Wrench,
  Package,
  Sofa,
  MessageCircle,
  Factory,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { clearUser } from "../../../redux/userSlice";
import { logout } from "../../../api/authApi";
import { useApp } from "../../../context/useApp";
import { ROUTES } from "../../../constants/router";
import { formatDate } from "../../../utils/formatDate";
import "./adminHeader.scss";

const NAV_ITEMS = [
  { to: ROUTES.ADMIN.DASHBOARD, label: "Dashboard", Icon: BarChart2 },
  { to: ROUTES.ADMIN.ORDERS, label: "Đơn hàng", Icon: ClipboardList },
  { to: ROUTES.ADMIN.TECHNICAL, label: "Kỹ thuật", Icon: Settings },
  { to: ROUTES.ADMIN.WAREHOUSE, label: "Thủ kho", Icon: Warehouse },
  { to: ROUTES.ADMIN.PURCHASING, label: "Mua hàng", Icon: ShoppingCart },
  { to: ROUTES.ADMIN.FACTORY, label: "Nhà máy", Icon: Wrench },
  { to: ROUTES.ADMIN.FINISHED_GOODS, label: "Thành phẩm", Icon: Package },
  { to: ROUTES.ADMIN.PRODUCTS, label: "Sản phẩm", Icon: Sofa },
  { to: ROUTES.ADMIN.CHAT, label: "Chat", Icon: MessageCircle },
];

const NOTIFY_ROUTE = {
  order_confirmed: ROUTES.ADMIN.TECHNICAL,
  production_created: ROUTES.ADMIN.WAREHOUSE,
  purchasing_created: ROUTES.ADMIN.PURCHASING,
  goods_stocked: ROUTES.ADMIN.WAREHOUSE,
  handover_created: ROUTES.ADMIN.FACTORY,
  production_reported: ROUTES.ADMIN.WAREHOUSE,
  finished_received: ROUTES.ADMIN.FINISHED_GOODS,
  design_requested: ROUTES.ADMIN.TECHNICAL,
  design_provided: ROUTES.ADMIN.FACTORY,
  order_delivered: ROUTES.ADMIN.ORDERS,
};

export default function AdminHeader() {
  const {
    orders,
    productionRequests,
    purchaseRequests,
    handoverOrders,
    designRequests,
    productionReports,
    pendingNotifications,
    globalNotifications,
    markAllGlobalRead,
    clearGlobalNotifications,
  } = useApp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openNotify, setOpenNotify] = useState(false);
  const notifyRef = useRef(null);

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
  const pendingReceive = productionReports.filter(
    (r) => r.status === "reported",
  ).length;
  const unreadGlobal = globalNotifications.filter((n) => !n.read).length;
  const technicalAlerts = pendingDesign + pendingNotifications.length;
  const warehouseAlerts = pendingPR + pendingHandover + pendingReceive;
  const totalAlerts =
    pendingPR +
    pendingPurchase +
    pendingHandover +
    pendingDesign +
    pendingOrders +
    pendingNotifications.length +
    unreadGlobal +
    pendingReceive;

  useEffect(() => {
    const onClick = (e) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setOpenNotify(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Lỗi đăng xuất:", e);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    dispatch(clearUser());
    window.dispatchEvent(new Event("userChanged"));
    navigate(ROUTES.USER.HOME);
  };

  const openNote = (note) => {
    setOpenNotify(false);
    markAllGlobalRead();
    const to = NOTIFY_ROUTE[note.type] || ROUTES.ADMIN.DASHBOARD;
    navigate(to);
  };

  return (
    <header className="admin-header">
      <div className="admin-header__top">
        <div className="admin-header__brand">
          <Factory
            size={22}
            strokeWidth={1.8}
            className="admin-header__brand-icon"
          />
          <div>
            <strong>Kho Xưởng ERP</strong>
            <small>Hệ thống quản lý sản xuất</small>
          </div>
        </div>

        <div className="admin-header__right">
          <div className="admin-header__notify" ref={notifyRef}>
            <button
              type="button"
              className={`admin-header__alert ${totalAlerts > 0 ? "is-active" : ""}`}
              onClick={() => setOpenNotify((v) => !v)}
            >
              <Bell size={14} strokeWidth={2} style={{ marginRight: 5 }} />
              {totalAlerts > 0 ? `${totalAlerts} thông báo` : "Thông báo"}
            </button>
            {openNotify && (
              <div className="admin-header__notify-panel">
                <div className="admin-header__notify-head">
                  <strong>Thông báo quy trình</strong>
                  {globalNotifications.length > 0 && (
                    <button type="button" onClick={clearGlobalNotifications}>
                      Xóa hết
                    </button>
                  )}
                </div>
                {globalNotifications.length === 0 ? (
                  <p className="admin-header__notify-empty">
                    Chưa có thông báo bước nào.
                  </p>
                ) : (
                  <ul>
                    {globalNotifications.slice(0, 20).map((n) => (
                      <li key={n.id} className={n.read ? "is-read" : ""}>
                        <button type="button" onClick={() => openNote(n)}>
                          <span
                            className={`admin-header__notify-dot admin-header__notify-dot--${n.color}`}
                          />
                          <span className="admin-header__notify-body">
                            <strong>{n.label}</strong>
                            <small>
                              {n.dept}
                              {n.meta?.productName
                                ? ` · ${n.meta.productName}`
                                : ""}
                              {n.meta?.name ? ` · ${n.meta.name}` : ""}
                            </small>
                            <em>{formatDate(n.time)}</em>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="admin-header__user">
            <span className="admin-header__avatar">
              <User size={16} strokeWidth={2} />
            </span>
            <span className="admin-header__username">Admin</span>
          </div>
          <button className="admin-header__logout" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={2} style={{ marginRight: 5 }} />
            Đăng xuất
          </button>
        </div>
      </div>

      <nav className="admin-header__nav">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          let badge = 0;
          if (to === ROUTES.ADMIN.ORDERS) badge = pendingOrders;
          if (to === ROUTES.ADMIN.WAREHOUSE) badge = warehouseAlerts;
          if (to === ROUTES.ADMIN.PURCHASING) badge = pendingPurchase;
          if (to === ROUTES.ADMIN.TECHNICAL) badge = technicalAlerts;
          if (to === ROUTES.ADMIN.FACTORY) badge = pendingHandover;
          if (to === ROUTES.ADMIN.FINISHED_GOODS) badge = pendingReceive;

          return (
            <NavLink
              key={to}
              to={to}
              end={to === ROUTES.ADMIN.DASHBOARD}
              className={({ isActive }) =>
                `admin-header__nav-item ${isActive ? "active" : ""}`
              }
            >
              <div className="admin-header__nav-icon">
                <Icon size={16} strokeWidth={2} />
              </div>
              <div>{label}</div>
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
