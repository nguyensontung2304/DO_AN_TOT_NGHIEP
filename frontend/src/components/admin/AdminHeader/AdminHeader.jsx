import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

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

// DANH SÁCH COMPONENT ADMIN
// code phải trùng với admin_components.code trong database
const NAV_ITEMS = [
  {
    code: "dashboard",
    to: ROUTES.ADMIN.DASHBOARD,
    label: "Dashboard",
    Icon: BarChart2,
  },
  {
    code: "orders",
    to: ROUTES.ADMIN.ORDERS,
    label: "Đơn hàng",
    Icon: ClipboardList,
  },
  {
    code: "technical",
    to: ROUTES.ADMIN.TECHNICAL,
    label: "Kỹ thuật",
    Icon: Settings,
  },
  {
    code: "warehouse",
    to: ROUTES.ADMIN.WAREHOUSE,
    label: "Thủ kho",
    Icon: Warehouse,
  },
  {
    code: "purchasing",
    to: ROUTES.ADMIN.PURCHASING,
    label: "Mua hàng",
    Icon: ShoppingCart,
  },
  {
    code: "factory",
    to: ROUTES.ADMIN.FACTORY,
    label: "Nhà máy",
    Icon: Wrench,
  },
  {
    code: "finished_goods",
    to: ROUTES.ADMIN.FINISHED_GOODS,
    label: "Thành phẩm",
    Icon: Package,
  },
  {
    code: "products",
    to: ROUTES.ADMIN.PRODUCTS,
    label: "Sản phẩm",
    Icon: Sofa,
  },
  {
    code: "chat",
    to: ROUTES.ADMIN.CHAT,
    label: "Chat",
    Icon: MessageCircle,
  },
];

// ĐƯỜNG DẪN ĐI TỪ THÔNG BÁO
const NOTIFY_ROUTE = {
  order_created: ROUTES.ADMIN.ORDERS,
  order_processing: ROUTES.ADMIN.ORDERS,
  order_confirmed: ROUTES.ADMIN.TECHNICAL,
  production_created: ROUTES.ADMIN.WAREHOUSE,
  purchasing_created: ROUTES.ADMIN.PURCHASING,
  goods_stocked: ROUTES.ADMIN.WAREHOUSE,
  handover_created: ROUTES.ADMIN.FACTORY,
  production_reported: ROUTES.ADMIN.WAREHOUSE,
  finished_received: ROUTES.ADMIN.FINISHED_GOODS,
  design_requested: ROUTES.ADMIN.TECHNICAL,
  design_provided: ROUTES.ADMIN.FACTORY,
  order_completed: ROUTES.ADMIN.ORDERS,
  order_delivered: ROUTES.ADMIN.ORDERS,
};

const DEPT_BY_CODE = {
  orders: "Đơn hàng",
  technical: "Kỹ thuật",
  warehouse: "Thủ kho",
  purchasing: "Mua hàng",
  factory: "Nhà máy",
  finished_goods: "Thành phẩm",
};

export default function AdminHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useSelector((state) => state.user.currentUser);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const {
    globalNotifications = [],
    markAllGlobalRead,
    markGlobalReadForDept,
    clearGlobalNotifications,
  } = useApp();

  const currentNav = NAV_ITEMS.find((item) =>
    location.pathname.startsWith(item.to),
  );
  const navDept = DEPT_BY_CODE[currentNav?.code];

  useEffect(() => {
    if (navDept) markGlobalReadForDept?.(navDept);
  }, [location.pathname, navDept, markGlobalReadForDept]);

  // KIỂM TRA QUYỀN ADMIN
  const isRootAdmin =
    currentUser?.isRootAdmin === true ||
    currentUser?.email?.trim().toLowerCase() === "admin@gmail.com";

  const permissions = Array.isArray(currentUser?.permissions)
    ? currentUser.permissions
    : [];

  const visibleNavItems = isRootAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => permissions.includes(item.code));

  // ĐÓNG THÔNG BÁO KHI BẤM RA NGOÀI
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // SỐ LƯỢNG THÔNG BÁO
  const unreadGlobal = globalNotifications.filter(
    (item) => !item.isRead && !item.read,
  );
  const totalAlerts = unreadGlobal.length;

  // ĐĂNG XUẤT
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");

      dispatch(clearUser());

      window.dispatchEvent(new Event("userChanged"));

      navigate("/", { replace: true });
    }
  };

  // MỞ THÔNG BÁO
  const openNote = (note) => {
    const targetRoute = NOTIFY_ROUTE[note.type] || ROUTES.ADMIN.DASHBOARD;

    if (note.dept) markGlobalReadForDept?.(note.dept);
    setShowNotifications(false);
    navigate(targetRoute);
  };

  // XÓA TẤT CẢ THÔNG BÁO
  const handleClearNotifications = () => {
    if (typeof clearGlobalNotifications === "function") {
      clearGlobalNotifications();
    }

    if (typeof markAllGlobalRead === "function") {
      markAllGlobalRead();
    }
  };

  // SỐ BADGE THEO TỪNG COMPONENT
  const getBadgeCount = (code) => {
    const dept = DEPT_BY_CODE[code];
    return dept ? unreadGlobal.filter((note) => note.dept === dept).length : 0;
  };

  return (
    <header className="admin-header">
      {/* PHẦN TRÊN CỦA HEADER */}
      <div className="admin-header__top">
        <div className="admin-header__brand">
          <Warehouse size={24} />

          <div>
            <strong>Kho Xưởng ERP</strong>
            <small>Hệ thống quản lý sản xuất</small>
          </div>
        </div>

        <div className="admin-header__right">
          {/* Chỉ admin gốc thấy thông báo tổng hợp */}
          {isRootAdmin && (
            <div className="admin-header__notify" ref={notificationRef}>
              <button
                type="button"
                className={`admin-header__alert ${totalAlerts > 0 ? "is-active" : ""}`}
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Thông báo"
              >
                <Bell size={14} strokeWidth={2} style={{ marginRight: 5 }} />

                {totalAlerts > 0
                  ? `${totalAlerts > 99 ? "99+" : totalAlerts} thông báo`
                  : "Thông báo"}
              </button>

              {showNotifications && (
                <div className="admin-header__notify-panel">
                  <div className="admin-header__notify-head">
                    <strong>Thông báo hệ thống</strong>

                    {globalNotifications.length > 0 && (
                      <button type="button" onClick={handleClearNotifications}>
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  {globalNotifications.length === 0 ? (
                    <p className="admin-header__notify-empty">
                      Không có thông báo mới
                    </p>
                  ) : (
                    <ul>
                      {globalNotifications.slice(0, 20).map((note, index) => (
                        <li
                          key={note.id ?? index}
                          className={note.isRead || note.read ? "is-read" : ""}
                        >
                          <button type="button" onClick={() => openNote(note)}>
                            <span
                              className={`admin-header__notify-dot admin-header__notify-dot--${
                                note.color || "blue"
                              }`}
                            />
                            <span className="admin-header__notify-body">
                              <strong>
                                {note.title ||
                                  note.label ||
                                  "Thông báo hệ thống"}
                              </strong>
                              <small>
                                {note.message || note.content || ""}
                              </small>
                              {note.createdAt && (
                                <em>{formatDate(note.createdAt)}</em>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Thông tin tài khoản */}
          <div className="admin-header__user">
            <span className="admin-header__avatar">
              <User size={18} />
            </span>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <span className="admin-header__username">
                {currentUser?.name || currentUser?.email || "Admin"}
              </span>

              <small style={{ fontSize: "11px", color: "#8892b0" }}>
                {isRootAdmin ? "Quản trị viên gốc" : "Quản trị viên"}
              </small>
            </div>
          </div>

          {/* Đăng xuất */}
          <button
            type="button"
            className="admin-header__logout"
            onClick={handleLogout}
          >
            <LogOut size={15} strokeWidth={2} style={{ marginRight: 5 }} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* MENU COMPONENT:
          Admin gốc (admin@gmail.com): thấy toàn bộ danh sách để chuyển qua lại giữa các component
          Admin bộ phận: chỉ thấy đúng component mình được cấp quyền */}
      <nav className="admin-header__nav">
        {visibleNavItems.map(({ code, to, label, Icon }) => {
          const badgeCount = getBadgeCount(code);

          return (
            <NavLink
              key={code}
              to={to}
              end={to === ROUTES.ADMIN.DASHBOARD}
              className={({ isActive }) =>
                `admin-header__nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => {
                const dept = DEPT_BY_CODE[code];
                if (dept) markGlobalReadForDept?.(dept);
              }}
            >
              <div className="admin-header__nav-icon">
                <Icon size={16} strokeWidth={2} />
              </div>

              <div>{label}</div>

              {badgeCount > 0 && (
                <span className="admin-header__nav-badge">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
